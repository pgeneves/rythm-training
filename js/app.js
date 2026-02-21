const { useState, useEffect, useRef } = React;
const { Container, Box, Button, Typography, Paper, Alert } = MaterialUI;

function App() {
  const [tempo, setTempo] = useState(120);
  const [activeBeats, setActiveBeats] = useState(Array(16).fill(true));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.02);
  const [accuracyResults, setAccuracyResults] = useState(
    Array(16).fill({ status: 'neutral', detected: false, level: 0 })
  );

  const audioServiceRef = useRef(null);
  const beatServiceRef = useRef(null);
  const visualizationServiceRef = useRef(null);
  const accuracyServiceRef = useRef(null);
  const animationServiceRef = useRef(null);
  const appStateServiceRef = useRef(null);

  useEffect(() => {
    audioServiceRef.current = new AudioService();
    beatServiceRef.current = new BeatService(tempo);
    accuracyServiceRef.current = new AccuracyService();
    animationServiceRef.current = new AnimationService();
    appStateServiceRef.current = new AppStateService();

    return () => {
      if (audioServiceRef.current) {
        audioServiceRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    beatServiceRef.current.start();

    const animationCallbacks = {
      onFrame: () => {
        const beat = beatServiceRef.current.getCurrentBeat();
        const waveformData = audioServiceRef.current.getWaveformData();

        const transition = animationServiceRef.current.detectBeatTransition(beat);

        if (transition.occurred) {
          const level = accuracyServiceRef.current.calculateAudioLevel(waveformData);
          const soundDetected = level > threshold;
          const result = accuracyServiceRef.current.evaluateAccuracy(
            activeBeats[transition.previousBeat],
            soundDetected,
            level
          );

          setAccuracyResults(prev =>
            appStateServiceRef.current.processAccuracyUpdate(prev, transition.previousBeat, result)
          );
        }

        setCurrentBeat(beat);

        if (visualizationServiceRef.current) {
          visualizationServiceRef.current.draw(waveformData, activeBeats, beat);
        }
      }
    };

    animationServiceRef.current.start(animationCallbacks);

    return () => {
      animationServiceRef.current.stop();
      beatServiceRef.current.stop();
    };
  }, [isPlaying, activeBeats, threshold]);

  const handleStart = async () => {
    if (!audioInitialized) {
      const result = await audioServiceRef.current.initialize();
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAudioInitialized(true);
      setError(null);
    }

    const initialState = appStateServiceRef.current.initializePlaybackState();
    setAccuracyResults(initialState.accuracyResults);
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

  const handleBeatToggle = (beatIndex) => {
    setActiveBeats(prev => {
      const newBeats = [...prev];
      newBeats[beatIndex] = !newBeats[beatIndex];
      return newBeats;
    });
  };

  const playbackControl = PlaybackControlDTO.create({ tempo, threshold, activeBeats });
  const beatState = BeatStateDTO.create({ currentBeat, activeBeats, accuracyResults });

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
          onTempoChange={handleTempoChange}
          onThresholdChange={handleThresholdChange}
          onBeatToggle={handleBeatToggle}
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
