const ControlHeader = ({
  playbackControl,
  isPlaying,
  calibrationState,
  onTempoChange,
  onThresholdChange,
  onBeatToggle,
  onCalibrationToggle,
  onAddLayer,
  onRemoveLayer,
  onLabelChange,
  onTickToggle,
  onTickFrequencyChange,
  onSimilarityThresholdChange,
}) => {
  return (
    <MaterialUI.Box className="flex-center-column gap-md mb-lg">
      <MaterialUI.Box className="flex-center-row gap-md" sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
        <TempoInput tempo={playbackControl.tempo} onChange={onTempoChange} />
        <ThresholdInput threshold={playbackControl.threshold} onChange={onThresholdChange} />
        <TickFrequencyInput tickFrequency={playbackControl.tickFrequency} onChange={onTickFrequencyChange} />
        <SimilarityThresholdInput similarityThreshold={playbackControl.similarityThreshold} onChange={onSimilarityThresholdChange} />
        <MaterialUI.FormControlLabel
          control={
            <MaterialUI.Checkbox
              checked={playbackControl.tickEnabled}
              onChange={onTickToggle}
              size="small"
            />
          }
          label={
            <MaterialUI.Typography variant="body2">Tick</MaterialUI.Typography>
          }
        />
      </MaterialUI.Box>
      <MultiLayerBeatSelector
        soundLayers={playbackControl.soundLayers}
        isPlaying={isPlaying}
        calibrationState={calibrationState}
        onBeatToggle={onBeatToggle}
        onCalibrationToggle={onCalibrationToggle}
        onAddLayer={onAddLayer}
        onRemoveLayer={onRemoveLayer}
        onLabelChange={onLabelChange}
      />
    </MaterialUI.Box>
  );
};
