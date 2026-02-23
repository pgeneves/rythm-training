const InstrumentsTab = ({
  soundLayers,
  threshold,
  similarityThreshold,
  calibrationState,
  isPlaying,
  onThresholdChange,
  onSimilarityThresholdChange,
  onCalibrationToggle,
  onAddLayer,
  onRemoveLayer,
  onLabelChange,
}) => {
  return (
    <MaterialUI.Box sx={{ p: 2 }}>
      <MaterialUI.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <ThresholdInput threshold={threshold} onChange={onThresholdChange} />
        <SimilarityThresholdInput similarityThreshold={similarityThreshold} onChange={onSimilarityThresholdChange} />
      </MaterialUI.Box>

      <MaterialUI.Divider sx={{ mb: 2 }} />

      <MaterialUI.Box>
        {soundLayers.map(layer => (
          <InstrumentLayerRow
            key={layer.id}
            layer={layer}
            isPlaying={isPlaying}
            isCalibrating={calibrationState.isRecording && calibrationState.targetLayerId === layer.id}
            onCalibrationToggle={() => onCalibrationToggle(layer.id)}
            onLabelChange={newLabel => onLabelChange(layer.id, newLabel)}
            onRemove={() => onRemoveLayer(layer.id)}
            isOnlyRow={soundLayers.length === 1}
          />
        ))}
      </MaterialUI.Box>

      <MaterialUI.Button
        variant="outlined"
        size="small"
        onClick={onAddLayer}
        disabled={isPlaying}
        sx={{ mt: 1 }}
      >
        + Add Instrument
      </MaterialUI.Button>
    </MaterialUI.Box>
  );
};
