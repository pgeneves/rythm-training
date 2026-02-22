const { useState, useEffect, useRef } = React;
const { Container, Box, Button, Typography, Paper, Alert } = MaterialUI;

function App() {
  const [tempo, setTempo] = useState(60);
  const [soundLayers, setSoundLayers] = useState([
    SoundLayerDTO.create({ label: 'Sound 1' }),
    SoundLayerDTO.create({ label: 'Sound 2' }),
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.0001);
  const [calibrationState, setCalibrationState] = useState({ isRecording: false, targetLayerId: null });
  const [tickEnabled, setTickEnabled] = useState(true);
  const [tickFrequency, setTickFrequency] = useState(1000);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.65);

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
      frequencyAnalysisServiceRef.current
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
  useEffect(() => { soundLayersRef.current = soundLayers; }, [soundLayers]);

  const tickEnabledRef = useRef(tickEnabled);
  useEffect(() => { tickEnabledRef.current = tickEnabled; }, [tickEnabled]);

  const tickFrequencyRef = useRef(tickFrequency);
  useEffect(() => { tickFrequencyRef.current = tickFrequency; }, [tickFrequency]);

  const thresholdRef = useRef(threshold);
  useEffect(() => { thresholdRef.current = threshold; }, [threshold]);

  const similarityThresholdRef = useRef(similarityThreshold);
  useEffect(() => { similarityThresholdRef.current = similarityThreshold; }, [similarityThreshold]);

  useEffect(() => {
    if (!isPlaying) return;

    beatServiceRef.current.start();

    const animationCallbacks = {
      onFrame: () => {
        const beat = beatServiceRef.current.getCurrentBeat();
        const waveformData = audioServiceRef.current.getWaveformData();
        const transition = animationServiceRef.current.detectBeatTransition(beat);

        if (transition.occurred) {
          // Metronome tick at bar starts
          if (tickEnabledRef.current && [0, 4, 8, 12].includes(beat)) {
            metronomeServiceRef.current.tick(
              audioServiceRef.current.getAudioContext(),
              tickFrequencyRef.current
            );
          }

          const level = accuracyServiceRef.current.calculateAudioLevel(waveformData);
          const soundDetected = level > thresholdRef.current;

          const freqData = soundDetected
            ? audioServiceRef.current.getFrequencyData()
            : null;

          let match = null;
          if (soundDetected && freqData) {
            const audioCtx = audioServiceRef.current.getAudioContext();
            const sampleRate = audioCtx ? audioCtx.sampleRate : 44100;
            const excludeRange = frequencyAnalysisServiceRef.current.getTickExclusionRange(
              tickFrequencyRef.current,
              sampleRate
            );
            match = frequencyAnalysisServiceRef.current.classifySound(
              freqData,
              soundLayersRef.current,
              similarityThresholdRef.current,
              excludeRange
            );
          }
          const detectedLayerId = match ? match.layerId : null;

          setSoundLayers(prev => {
            let updated = prev;
            for (const layer of prev) {
              const result = accuracyServiceRef.current.evaluateLayerAccuracy(
                layer,
                transition.previousBeat,
                detectedLayerId,
                soundDetected
              );
              updated = appStateServiceRef.current.processLayerAccuracyUpdate(
                updated,
                layer.id,
                transition.previousBeat,
                result
              );
            }
            return updated;
          });
        }

        setCurrentBeat(beat);

        const currentLayers = soundLayersRef.current;
        const mergedBeats = currentLayers.reduce(
          (acc, layer) => acc.map((v, i) => v || layer.beats[i]),
          Array(16).fill(false)
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
        frequencyAnalysisServiceRef.current
      );
    }

    setSoundLayers(prev => appStateServiceRef.current.initializeLayersAccuracy(prev));
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
    setTickEnabled(prev => !prev);
  };

  const handleTickFrequencyChange = (newFreq) => {
    setTickFrequency(newFreq);
  };

  const handleSimilarityThresholdChange = (newVal) => {
    setSimilarityThreshold(newVal);
  };

  const handleBeatToggle = (layerId, beatIndex) => {
    setSoundLayers(prev => prev.map(layer => {
      if (layer.id !== layerId) return layer;
      const newBeats = [...layer.beats];
      newBeats[beatIndex] = !newBeats[beatIndex];
      return { ...layer, beats: newBeats };
    }));
  };

  const handleAddLayer = () => {
    const count = soundLayers.length + 1;
    setSoundLayers(prev => [...prev, SoundLayerDTO.create({ label: `Sound ${count}` })]);
  };

  const handleRemoveLayer = (layerId) => {
    setSoundLayers(prev => prev.filter(l => l.id !== layerId));
  };

  const handleLabelChange = (layerId, newLabel) => {
    setSoundLayers(prev => prev.map(l =>
      l.id === layerId ? { ...l, label: newLabel } : l
    ));
  };

  const handleCalibrationToggle = async (layerId) => {
    if (calibrationState.isRecording && calibrationState.targetLayerId === layerId) {
      const profile = calibrationServiceRef.current.stopRecording();
      if (profile) {
        setSoundLayers(prev => prev.map(l =>
          l.id === layerId ? { ...l, profile } : l
        ));
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
          frequencyAnalysisServiceRef.current
        );
      }
      calibrationServiceRef.current.startRecording();
      setCalibrationState({ isRecording: true, targetLayerId: layerId });
    }
  };

  const playbackControl = PlaybackControlDTO.create({
    tempo,
    threshold,
    soundLayers,
    tickEnabled,
    tickFrequency,
    similarityThreshold,
  });
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        }}
      >
        <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
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

        <ControlHeader
          playbackControl={playbackControl}
          isPlaying={isPlaying}
          calibrationState={calibrationState}
          onTempoChange={handleTempoChange}
          onThresholdChange={handleThresholdChange}
          onBeatToggle={handleBeatToggle}
          onCalibrationToggle={handleCalibrationToggle}
          onAddLayer={handleAddLayer}
          onRemoveLayer={handleRemoveLayer}
          onLabelChange={handleLabelChange}
          onTickToggle={handleTickToggle}
          onTickFrequencyChange={handleTickFrequencyChange}
          onSimilarityThresholdChange={handleSimilarityThresholdChange}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStart}
            disabled={isPlaying}
            size="large"
          >
            Start
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleStop}
            disabled={!isPlaying}
            size="large"
          >
            Stop
          </Button>
        </Box>

        <VisualizationPanel
          visualizationServiceRef={visualizationServiceRef}
          isPlaying={isPlaying}
        />

        <AccuracyFeedback beatState={beatState} />

        {isPlaying && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Current Beat: {currentBeat + 1} / 16 | Tempo: {tempo} BPM
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

console.log('React:', typeof React !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('ReactDOM:', typeof ReactDOM !== 'undefined' ? 'Loaded' : 'NOT LOADED');
console.log('MaterialUI:', typeof MaterialUI !== 'undefined' ? 'Loaded' : 'NOT LOADED');
