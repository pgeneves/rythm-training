const AccuracyFeedback = ({ beatState }) => {
  const { soundLayers, currentBeat } = beatState;

  const getColor = (status) => {
    switch (status) {
      case 'correct':   return '#4caf50';
      case 'incorrect': return '#f44336';
      case 'neutral':
      default:          return '#e0e0e0';
    }
  };

  return (
    <MaterialUI.Box className="flex-center-column gap-sm" sx={{ mt: 3, width: '100%' }}>
      <MaterialUI.Typography variant="h6" className="mb-sm" sx={{ textAlign: 'center' }}>
        Accuracy Feedback
      </MaterialUI.Typography>

      {soundLayers.map(layer => (
        <MaterialUI.Box key={layer.id} sx={{ width: '100%', mb: 1 }}>
          <MaterialUI.Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: '#555' }}>
            {layer.label}
          </MaterialUI.Typography>

          {layer.profile === null ? (
            <MaterialUI.Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
              Calibrate to see feedback
            </MaterialUI.Typography>
          ) : (
            <MaterialUI.Box sx={{ display: 'flex', width: '100%', gap: 0.5 }}>
              {layer.accuracyResults.map((result, index) => {
                const isCurrentBeat = index === currentBeat;
                return (
                  <MaterialUI.Box
                    key={index}
                    className={`accuracy-feedback-item ${isCurrentBeat ? 'current' : ''}`}
                    sx={{
                      backgroundColor: getColor(result.status),
                      marginRight: (index + 1) % 4 === 0 && index < 15 ? 1.5 : 0
                    }}
                  >
                    <MaterialUI.Typography
                      variant="body2"
                      sx={{
                        fontWeight: isCurrentBeat ? 'bold' : 'normal',
                        color: result.status === 'neutral' ? '#666' : '#fff',
                        fontSize: '0.7rem',
                      }}
                    >
                      {index + 1}
                    </MaterialUI.Typography>
                  </MaterialUI.Box>
                );
              })}
            </MaterialUI.Box>
          )}
        </MaterialUI.Box>
      ))}
    </MaterialUI.Box>
  );
};
