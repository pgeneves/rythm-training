const AccuracyFeedback = ({ beatState }) => {
  const { accuracyResults, activeBeats, currentBeat } = beatState;
  const getColor = (status) => {
    switch (status) {
      case 'correct':
        return '#4caf50'; // GREEN
      case 'incorrect':
        return '#f44336'; // RED
      case 'neutral':
      default:
        return '#e0e0e0'; // GRAY
    }
  };

  return (
    <MaterialUI.Box className="flex-center-column gap-sm" sx={{ mt: 3, width: '100%' }}>
      <MaterialUI.Typography variant="h6" className="mb-sm" sx={{ textAlign: 'center' }}>
        Accuracy Feedback
      </MaterialUI.Typography>

      <MaterialUI.Box sx={{ display: 'flex', width: '100%', gap: 0.5 }}>
        {accuracyResults.map((result, index) => {
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
                  color: result.status === 'neutral' ? '#666' : '#fff'
                }}
              >
                {index + 1}
              </MaterialUI.Typography>
            </MaterialUI.Box>
          );
        })}
      </MaterialUI.Box>
    </MaterialUI.Box>
  );
};
