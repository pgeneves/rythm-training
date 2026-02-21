const BeatSelector = ({ activeBeats, onToggle }) => {
  const handleToggle = (beatIndex) => {
    onToggle(beatIndex);
  };

  const renderMeasure = (measureIndex) => {
    const startBeat = measureIndex * 4;
    const beats = [0, 1, 2, 3].map(offset => startBeat + offset);

    return (
      <MaterialUI.Box
        key={measureIndex}
        sx={{
          display: 'inline-flex',
          gap: 0.5,
          mr: measureIndex < 3 ? 2 : 0
        }}
      >
        {beats.map(beatIndex => (
          <MaterialUI.ToggleButton
            key={beatIndex}
            value={beatIndex}
            selected={activeBeats[beatIndex]}
            onChange={() => handleToggle(beatIndex)}
            size="small"
            sx={{
              width: 40,
              height: 40,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}
          >
            {beatIndex + 1}
          </MaterialUI.ToggleButton>
        ))}
      </MaterialUI.Box>
    );
  };

  return (
    <MaterialUI.Box className="flex-wrap-center gap-sm">
      {[0, 1, 2, 3].map(measureIndex => renderMeasure(measureIndex))}
    </MaterialUI.Box>
  );
};
