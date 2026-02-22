const MultiLayerBeatSelector = ({
  soundLayers,
  isPlaying,
  calibrationState,
  onBeatToggle,
  onCalibrationToggle,
  onAddLayer,
  onRemoveLayer,
  onLabelChange,
}) => {
  return (
    <MaterialUI.Box sx={{ width: '100%' }}>
      {soundLayers.map(layer => (
        <SoundLayerRow
          key={layer.id}
          layer={layer}
          isPlaying={isPlaying}
          isCalibrating={
            calibrationState.isRecording && calibrationState.targetLayerId === layer.id
          }
          onBeatToggle={beatIndex => onBeatToggle(layer.id, beatIndex)}
          onCalibrationToggle={() => onCalibrationToggle(layer.id)}
          onLabelChange={newLabel => onLabelChange(layer.id, newLabel)}
          onRemove={() => onRemoveLayer(layer.id)}
          isOnlyRow={soundLayers.length === 1}
        />
      ))}

      <MaterialUI.Button
        variant="outlined"
        size="small"
        onClick={onAddLayer}
        disabled={isPlaying}
        startIcon={<MaterialUI.Box component="span" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>+</MaterialUI.Box>}
        sx={{ mt: 1 }}
      >
        Add Sound
      </MaterialUI.Button>
    </MaterialUI.Box>
  );
};
