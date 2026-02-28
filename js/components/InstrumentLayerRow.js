const InstrumentLayerRow = ({
  layer,
  isPlaying,
  isCalibrating,
  onCalibrationToggle,
  onLabelChange,
  onRemove,
  isOnlyRow,
  keyBinding,
  onKeyBindingChange,
}) => {
  const { useState: useLocalState, useEffect: useLocalEffect } = React;
  const [editingLabel, setEditingLabel] = useLocalState(false);
  const [labelValue, setLabelValue] = useLocalState(layer.label);
  const [isListening, setIsListening] = useLocalState(false);

  useLocalEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsListening(false);
        return;
      }
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
      e.preventDefault();
      onKeyBindingChange(e.key);
      setIsListening(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

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

  return (
    <MaterialUI.Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid var(--color-panel-border)',
        pb: 1,
        mb: 1,
      }}
    >
      {/* Calibrate button */}
      <MaterialUI.Box sx={{ minWidth: 80 }}>
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
      </MaterialUI.Box>

      {/* Editable label */}
      <MaterialUI.Box sx={{ flex: 1, minWidth: 100 }}>
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
              width: '100%',
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

      {/* Profile chart */}
      <ProfileChart profile={layer.profile} isCalibrating={isCalibrating} />

      {/* Key binding chip */}
      <MaterialUI.Box sx={{ minWidth: 90 }}>
        {isListening ? (
          <MaterialUI.Chip
            label="Press a key…"
            size="small"
            color="warning"
            variant="outlined"
            onDelete={() => setIsListening(false)}
            sx={{ fontSize: '0.7rem' }}
          />
        ) : keyBinding ? (
          <MaterialUI.Chip
            label={keyBinding}
            size="small"
            color="primary"
            onDelete={() => onKeyBindingChange(null)}
            sx={{ fontSize: '0.7rem' }}
          />
        ) : (
          <MaterialUI.Chip
            label="Bind key"
            size="small"
            variant="outlined"
            onClick={() => setIsListening(true)}
            disabled={isPlaying}
            sx={{ fontSize: '0.7rem', cursor: 'pointer' }}
          />
        )}
      </MaterialUI.Box>

      {/* Delete button */}
      <MaterialUI.IconButton
        size="small"
        onClick={onRemove}
        disabled={isOnlyRow || isPlaying}
        color="error"
        title="Remove layer"
      >
        <MaterialUI.Box component="span" sx={{ fontSize: '1.1rem', lineHeight: 1 }}>✕</MaterialUI.Box>
      </MaterialUI.IconButton>
    </MaterialUI.Box>
  );
};
