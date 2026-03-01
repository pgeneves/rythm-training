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
  onKeyBindingChange,
  isTesting,
  liveFreqData,
  matchedLayerId,
  onTestToggle,
}) => {
  const matchedLayer = soundLayers.find(l => l.id === matchedLayerId);

  return (
    <MaterialUI.Box sx={{ p: 2 }}>
      <MaterialUI.Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <ThresholdInput threshold={threshold} onChange={onThresholdChange} />
        <SimilarityThresholdInput similarityThreshold={similarityThreshold} onChange={onSimilarityThresholdChange} />
      </MaterialUI.Box>

      <MaterialUI.Divider sx={{ mb: 2 }} />

      {/* Test row */}
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
        <MaterialUI.Box sx={{ minWidth: 80 }}>
          <MaterialUI.Button
            variant="contained"
            size="small"
            color={isTesting ? 'error' : 'primary'}
            onClick={onTestToggle}
            disabled={isPlaying}
            startIcon={
              <MaterialUI.Box component="span" sx={{ fontSize: '1rem' }}>
                {isTesting ? '⏹' : '🔊'}
              </MaterialUI.Box>
            }
            sx={{ fontSize: '0.7rem', minWidth: 72, px: 1 }}
          >
            {isTesting ? 'Stop' : 'TEST'}
          </MaterialUI.Button>
        </MaterialUI.Box>

        <MaterialUI.Box sx={{ flex: 1, minWidth: 100 }}>
          <MaterialUI.Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
            Live Input
          </MaterialUI.Typography>
        </MaterialUI.Box>

        <ProfileChart
          profile={null}
          isCalibrating={false}
          liveData={isTesting ? liveFreqData : null}
          isMatched={!!matchedLayerId}
          emptyLabel=""
        />

        <MaterialUI.Box sx={{ minWidth: 90 }}>
          {matchedLayer ? (
            <MaterialUI.Chip
              label={matchedLayer.label}
              size="small"
              color="success"
              sx={{ fontSize: '0.7rem' }}
            />
          ) : (
            <MaterialUI.Box sx={{ minWidth: 90 }} />
          )}
        </MaterialUI.Box>

        {/* Spacer to align with instrument row delete buttons */}
        <MaterialUI.Box sx={{ width: 30 }} />
      </MaterialUI.Box>

      {/* Instrument rows */}
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
            keyBinding={layer.keyBinding}
            onKeyBindingChange={key => onKeyBindingChange(layer.id, key)}
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
