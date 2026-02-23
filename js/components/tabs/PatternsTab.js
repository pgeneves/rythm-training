const PatternsTab = ({
  soundLayers,
  isPlaying,
  onBeatToggle,
}) => {
  if (soundLayers.length === 0) {
    return (
      <MaterialUI.Box sx={{ p: 2 }}>
        <MaterialUI.Typography variant="body2" color="text.secondary">
          No instruments defined. Add instruments in the Instruments tab.
        </MaterialUI.Typography>
      </MaterialUI.Box>
    );
  }

  return (
    <MaterialUI.Box sx={{ p: 2 }}>
      {soundLayers.map(layer => (
        <SoundLayerRow
          key={layer.id}
          layer={layer}
          isPlaying={isPlaying}
          onBeatToggle={(beatIndex) => onBeatToggle(layer.id, beatIndex)}
        />
      ))}
    </MaterialUI.Box>
  );
};
