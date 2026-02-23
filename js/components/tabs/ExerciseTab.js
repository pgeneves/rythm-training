const ExerciseTab = ({
  tempo,
  isPlaying,
  currentBeat,
  tickEnabled,
  tickFrequency,
  beatState,
  visualizationServiceRef,
  onTempoChange,
  onTickToggle,
  onTickFrequencyChange,
  onStart,
  onStop,
}) => {
  return (
    <MaterialUI.Box sx={{ p: 2 }}>
      {/* Control row */}
      <MaterialUI.Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TempoInput tempo={tempo} onChange={onTempoChange} />
        <MaterialUI.FormControlLabel
          control={
            <MaterialUI.Checkbox
              checked={tickEnabled}
              onChange={onTickToggle}
              size="small"
            />
          }
          label={
            <MaterialUI.Typography variant="body2">Tick</MaterialUI.Typography>
          }
        />
        {tickEnabled && (
          <TickFrequencyInput tickFrequency={tickFrequency} onChange={onTickFrequencyChange} />
        )}
      </MaterialUI.Box>

      {/* Start / Stop buttons */}
      <MaterialUI.Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <MaterialUI.Button
          variant="contained"
          color="primary"
          onClick={onStart}
          disabled={isPlaying}
          size="large"
        >
          Start
        </MaterialUI.Button>
        <MaterialUI.Button
          variant="outlined"
          color="secondary"
          onClick={onStop}
          disabled={!isPlaying}
          size="large"
        >
          Stop
        </MaterialUI.Button>
      </MaterialUI.Box>

      <VisualizationPanel
        visualizationServiceRef={visualizationServiceRef}
        isPlaying={isPlaying}
      />

      <AccuracyFeedback beatState={beatState} />

      {isPlaying && (
        <MaterialUI.Box sx={{ mt: 2, textAlign: 'center' }}>
          <MaterialUI.Typography variant="body2" color="text.secondary">
            Current Beat: {currentBeat + 1} / 16 | Tempo: {tempo} BPM
          </MaterialUI.Typography>
        </MaterialUI.Box>
      )}
    </MaterialUI.Box>
  );
};
