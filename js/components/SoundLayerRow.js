const SoundLayerRow = ({
  layer,
  isPlaying,
  isCalibrating,
  onBeatToggle,
  onCalibrationToggle,
  onLabelChange,
  onRemove,
  isOnlyRow,
}) => {
  const { useState: useLocalState } = React;
  const [editingLabel, setEditingLabel] = useLocalState(false);
  const [labelValue, setLabelValue] = useLocalState(layer.label);

  const handleLabelBlur = () => {
    setEditingLabel(false);
    const trimmed = labelValue.trim() || layer.label;
    setLabelValue(trimmed);
    onLabelChange(trimmed);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

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

  const calibratedChip = layer.profile !== null && (
    <MaterialUI.Chip
      label="Calibrated"
      size="small"
      sx={{
        backgroundColor: 'var(--color-correct)',
        color: 'white',
        fontSize: '0.7rem',
        height: 20,
        ml: 0.5,
      }}
    />
  );

  return (
    <MaterialUI.Box
      className="sound-layer-row"
      sx={{ borderBottom: '1px solid var(--color-panel-border)', pb: 1, mb: 1 }}
    >
      {/* Left: calibrate button */}
      <MaterialUI.Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
        <MaterialUI.Button
          variant="contained"
          size="small"
          color={isCalibrating ? 'error' : 'primary'}
          className={isCalibrating ? 'calibrate-btn-recording' : ''}
          onClick={onCalibrationToggle}
          disabled={isPlaying}
          startIcon={
            <MaterialUI.Box component="span" sx={{ fontSize: '1rem' }}>
              {isCalibrating ? '⏹' : '🎙'}
            </MaterialUI.Box>
          }
          sx={{ fontSize: '0.7rem', minWidth: 72, px: 1 }}
        >
          {isCalibrating ? 'Stop' : 'REC'}
        </MaterialUI.Button>
        {calibratedChip}
      </MaterialUI.Box>

      {/* Center: label + beat grid */}
      <MaterialUI.Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {/* Editable label */}
        <MaterialUI.Box sx={{ display: 'flex', alignItems: 'center' }}>
          {editingLabel ? (
            <input
              autoFocus
              value={labelValue}
              onChange={e => setLabelValue(e.target.value)}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid #1976d2',
                borderRadius: 4,
                padding: '2px 6px',
                outline: 'none',
                width: 120,
              }}
            />
          ) : (
            <MaterialUI.Typography
              variant="body2"
              sx={{ fontWeight: 500, cursor: 'pointer', '&:hover': { color: '#1976d2' } }}
              onClick={() => setEditingLabel(true)}
              title="Click to edit label"
            >
              {labelValue}
            </MaterialUI.Typography>
          )}
        </MaterialUI.Box>

        {/* Beat grid */}
        <MaterialUI.Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
          {[0, 1, 2, 3].map(groupIndex => renderBeatGroup(groupIndex))}
        </MaterialUI.Box>
      </MaterialUI.Box>

      {/* Right: delete button */}
      <MaterialUI.IconButton
        size="small"
        onClick={onRemove}
        disabled={isOnlyRow || isPlaying}
        color="error"
        title="Remove layer"
        sx={{ alignSelf: 'flex-start', mt: 0.5 }}
      >
        <MaterialUI.Box component="span" sx={{ fontSize: '1.1rem', lineHeight: 1 }}>✕</MaterialUI.Box>
      </MaterialUI.IconButton>
    </MaterialUI.Box>
  );
};
