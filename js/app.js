const { useState, useEffect, useRef } = React;
const { Container, Box, Typography, Paper, Alert, Tabs, Tab } = MaterialUI;

function App() {
  const [tempo, setTempo] = useState(60);
  const [soundLayers, setSoundLayers] = useState([
    SoundLayerDTO.create({ label: "Sound 1" }),
    SoundLayerDTO.create({ label: "Sound 2" }),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.0021);
  const [calibrationState, setCalibrationState] = useState({
    isRecording: false,
    targetLayerId: null,
  });
  const [tickEnabled, setTickEnabled] = useState(true);
  const [tickFrequency, setTickFrequency] = useState(1000);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);
  const [activeTab, setActiveTab] = useState(0);

  const manualHitsRef = useRef(new Set());

  const audioServiceRef = useRef(null);
  const beatServiceRef = useRef(null);
  const visualizationServiceRef = useRef(null);
  const accuracyServiceRef = useRef(null);
  const animationServiceRef = useRef(null);
  const appStateServiceRef = useRef(null);
  const frequencyAnalysisServiceRef = useRef(null);
  const calibrationServiceRef = useRef(null);
  const metronomeServiceRef = useRef(null);

  useEffect(() => {
    audioServiceRef.current = new AudioService();
    beatServiceRef.current = new BeatService(tempo);
    accuracyServiceRef.current = new AccuracyService();
    animationServiceRef.current = new AnimationService();
    appStateServiceRef.current = new AppStateService();
    frequencyAnalysisServiceRef.current = new FrequencyAnalysisService();
    calibrationServiceRef.current = new CalibrationService(
      audioServiceRef.current,
      accuracyServiceRef.current,
      frequencyAnalysisServiceRef.current,
      threshold,
    );
    metronomeServiceRef.current = new MetronomeService();

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.stop();
      }
    };
  }, []);

  // Refs so the animation loop always reads the latest values without re-subscribing
  const soundLayersRef = useRef(soundLayers);
  useEffect(() => {
    soundLayersRef.current = soundLayers;
  }, [soundLayers]);

  const tickEnabledRef = useRef(tickEnabled);
  useEffect(() => {
    tickEnabledRef.current = tickEnabled;
  }, [tickEnabled]);

  const tickFrequencyRef = useRef(tickFrequency);
  useEffect(() => {
    tickFrequencyRef.current = tickFrequency;
  }, [tickFrequency]);

  const thresholdRef = useRef(threshold);
  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);

  const similarityThresholdRef = useRef(similarityThreshold);
  useEffect(() => {
    similarityThresholdRef.current = similarityThreshold;
  }, [similarityThreshold]);

  // Keyboard listener for manual mode — active only while playing
  useEffect(() => {
    if (!isPlaying) return;

    const handleKeyDown = (e) => {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      for (const layer of soundLayersRef.current) {
        if (layer.keyBinding && layer.keyBinding === e.key) {
          manualHitsRef.current.add(layer.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    beatServiceRef.current.start();

    const animationCallbacks = {
      onFrame: () => {
        const beat = beatServiceRef.current.getCurrentBeat();
        const waveformData = audioServiceRef.current.getWaveformData();
        const transition =
          animationServiceRef.current.detectBeatTransition(beat);

        if (transition.occurred) {
          // Metronome tick at bar starts
          if (tickEnabledRef.current && [0, 4, 8, 12].includes(beat)) {
            metronomeServiceRef.current.tick(
              audioServiceRef.current.getAudioContext(),
              tickFrequencyRef.current,
            );
          }

          const level =
            accuracyServiceRef.current.calculateAudioLevel(waveformData);
          const soundDetected = level > thresholdRef.current;

          const freqData = soundDetected
            ? audioServiceRef.current.getFrequencyData()
            : null;

          let match = null;
          if (soundDetected && freqData) {
            const audioCtx = audioServiceRef.current.getAudioContext();
            const sampleRate = audioCtx ? audioCtx.sampleRate : 44100;
            const excludeRange =
              frequencyAnalysisServiceRef.current.getTickExclusionRange(
                tickFrequencyRef.current,
                sampleRate,
              );
            match = frequencyAnalysisServiceRef.current.classifySound(
              freqData,
              waveformData,
              soundLayersRef.current,
              similarityThresholdRef.current,
              excludeRange,
              sampleRate,
            );
          }
          const detectedLayerId = match ? match.layerId : null;

          setSoundLayers((prev) => {
            let updated = prev;
            for (const layer of prev) {
              const keyHit = layer.keyBinding
                ? manualHitsRef.current.has(layer.id)
                : false;
              const layerDetectedId = layer.keyBinding
                ? (keyHit ? layer.id : null)
                : detectedLayerId;
              const layerSoundDetected = layer.keyBinding ? keyHit : soundDetected;

              const result = accuracyServiceRef.current.evaluateLayerAccuracy(
                layer,
                transition.previousBeat,
                layerDetectedId,
                layerSoundDetected,
              );
              updated = appStateServiceRef.current.processLayerAccuracyUpdate(
                updated,
                layer.id,
                transition.previousBeat,
                result,
              );
            }
            manualHitsRef.current.clear();
            return updated;
          });
        }

        setCurrentBeat(beat);

        const currentLayers = soundLayersRef.current;
        const mergedBeats = currentLayers.reduce(
          (acc, layer) => acc.map((v, i) => v || layer.beats[i]),
          Array(16).fill(false),
        );

        if (visualizationServiceRef.current) {
          visualizationServiceRef.current.draw(waveformData, mergedBeats, beat);
        }
      },
    };

    animationServiceRef.current.start(animationCallbacks);

    return () => {
      animationServiceRef.current.stop();
      beatServiceRef.current.stop();
    };
  }, [isPlaying]);

  const handleStart = async () => {
    if (!audioInitialized) {
      const result = await audioServiceRef.current.initialize();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAudioInitialized(true);
      setError(null);
      calibrationServiceRef.current = new CalibrationService(
        audioServiceRef.current,
        accuracyServiceRef.current,
        frequencyAnalysisServiceRef.current,
        threshold,
      );
    }

    setSoundLayers((prev) =>
      appStateServiceRef.current.initializeLayersAccuracy(prev),
    );
    animationServiceRef.current.reset();

    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const handleTempoChange = (newTempo) => {
    setTempo(newTempo);
    if (beatServiceRef.current) {
      beatServiceRef.current.setTempo(newTempo);
    }
  };

  const handleThresholdChange = (newThreshold) => {
    setThreshold(newThreshold);
  };

  const handleTickToggle = () => {
    setTickEnabled((prev) => !prev);
  };

  const handleTickFrequencyChange = (newFreq) => {
    setTickFrequency(newFreq);
  };

  const handleSimilarityThresholdChange = (newVal) => {
    setSimilarityThreshold(newVal);
  };

  const handleBeatToggle = (layerId, beatIndex) => {
    setSoundLayers((prev) =>
      prev.map((layer) => {
        if (layer.id !== layerId) return layer;
        const newBeats = [...layer.beats];
        newBeats[beatIndex] = !newBeats[beatIndex];
        return { ...layer, beats: newBeats };
      }),
    );
  };

  const handleAddLayer = () => {
    const count = soundLayers.length + 1;
    setSoundLayers((prev) => [
      ...prev,
      SoundLayerDTO.create({ label: `Sound ${count}` }),
    ]);
  };

  const handleRemoveLayer = (layerId) => {
    setSoundLayers((prev) => prev.filter((l) => l.id !== layerId));
  };

  const handleLabelChange = (layerId, newLabel) => {
    setSoundLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, label: newLabel } : l)),
    );
  };

  const handleKeyBindingChange = (layerId, key) => {
    setSoundLayers((prev) =>
      prev.map((l) => (l.id === layerId ? { ...l, keyBinding: key } : l)),
    );
  };

  const handleCalibrationToggle = async (layerId) => {
    if (
      calibrationState.isRecording &&
      calibrationState.targetLayerId === layerId
    ) {
      const calibResult = calibrationServiceRef.current.stopRecording();
      if (calibResult) {
        const { profile, meydaFeatures } = calibResult;
        setSoundLayers((prev) =>
          prev.map((l) => (l.id === layerId ? { ...l, profile, meydaFeatures } : l)),
        );
      }
      setCalibrationState({ isRecording: false, targetLayerId: null });
    } else {
      if (!audioInitialized) {
        const result = await audioServiceRef.current.initialize();
        if (!result.success) {
          setError(result.error);
          return;
        }
        setAudioInitialized(true);
        setError(null);
        calibrationServiceRef.current = new CalibrationService(
          audioServiceRef.current,
          accuracyServiceRef.current,
          frequencyAnalysisServiceRef.current,
          threshold,
        );
      }
      calibrationServiceRef.current.startRecording();
      setCalibrationState({ isRecording: true, targetLayerId: layerId });
    }
  };

  const beatState = BeatStateDTO.create({
    currentBeat,
    soundLayers,
  });

  return (
    <Container maxWidth="lg">
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
        }}
      >
        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Rythme Training
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Rhythm Training with Beat Visualization
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 1 }}>
          <Tab label="Instruments" />
          <Tab label="Patterns" />
          <Tab label="Exercise" />
        </Tabs>

        {activeTab === 0 && (
          <InstrumentsTab
            soundLayers={soundLayers}
            threshold={threshold}
            similarityThreshold={similarityThreshold}
            calibrationState={calibrationState}
            isPlaying={isPlaying}
            onThresholdChange={handleThresholdChange}
            onSimilarityThresholdChange={handleSimilarityThresholdChange}
            onCalibrationToggle={handleCalibrationToggle}
            onAddLayer={handleAddLayer}
            onRemoveLayer={handleRemoveLayer}
            onLabelChange={handleLabelChange}
            onKeyBindingChange={handleKeyBindingChange}
          />
        )}

        {activeTab === 1 && (
          <PatternsTab
            soundLayers={soundLayers}
            isPlaying={isPlaying}
            onBeatToggle={handleBeatToggle}
          />
        )}

        {activeTab === 2 && (
          <ExerciseTab
            tempo={tempo}
            isPlaying={isPlaying}
            currentBeat={currentBeat}
            tickEnabled={tickEnabled}
            tickFrequency={tickFrequency}
            beatState={beatState}
            visualizationServiceRef={visualizationServiceRef}
            onTempoChange={handleTempoChange}
            onTickToggle={handleTickToggle}
            onTickFrequencyChange={handleTickFrequencyChange}
            onStart={handleStart}
            onStop={handleStop}
          />
        )}
      </Paper>
    </Container>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

console.log("React:", typeof React !== "undefined" ? "Loaded" : "NOT LOADED");
console.log(
  "ReactDOM:",
  typeof ReactDOM !== "undefined" ? "Loaded" : "NOT LOADED",
);
console.log(
  "MaterialUI:",
  typeof MaterialUI !== "undefined" ? "Loaded" : "NOT LOADED",
);
