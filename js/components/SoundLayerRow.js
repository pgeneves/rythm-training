const SoundLayerRow = ({
  layer,
  isPlaying,
  onBeatToggle,
}) => {
  const renderBeatGroup = (groupIndex) => {
    const startBeat = groupIndex * 4;
    return (
      <MaterialUI.Box
        key={groupIndex}
        sx={{ display: 'inline-flex', gap: 0.5, mr: groupIndex < 3 ? 1.5 : 0 }}
      >
        {[0, 1, 2, 3].map(offset => {
          const beatIndex = startBeat + offset;
          return (
            <MaterialUI.ToggleButton
              key={beatIndex}
              value={beatIndex}
              selected={layer.beats[beatIndex]}
              onChange={() => onBeatToggle(beatIndex)}
              disabled={isPlaying}
              size="small"
              sx={{ width: 36, height: 36, fontSize: '0.75rem', fontWeight: 'bold' }}
            >
              {beatIndex + 1}
            </MaterialUI.ToggleButton>
          );
        })}
      </MaterialUI.Box>
    );
  };

  return (
    <MaterialUI.Box
      className="sound-layer-row"
      sx={{ borderBottom: '1px solid var(--color-panel-border)', pb: 1, mb: 1 }}
    >
      <MaterialUI.Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <MaterialUI.Typography variant="body2" sx={{ fontWeight: 500 }}>
          {layer.label}
        </MaterialUI.Typography>
        <MaterialUI.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
          {[0, 1, 2, 3].map(groupIndex => renderBeatGroup(groupIndex))}
        </MaterialUI.Box>
      </MaterialUI.Box>
    </MaterialUI.Box>
  );
};
