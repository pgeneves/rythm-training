const ProfileChart = ({ profile, isCalibrating, width = 128, height = 48 }) => {
  const { useRef, useEffect } = React;
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !profile || isCalibrating) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const barW = width / 128;
    ctx.fillStyle = '#1976d2';

    let maxVal = 0;
    for (let i = 0; i < 128; i++) if (profile[i] > maxVal) maxVal = profile[i];

    for (let i = 0; i < 128; i++) {
      if (profile[i] === 0) continue;
      const barH = Math.max(1, (profile[i] / maxVal) * height);
      ctx.fillRect(i * barW, height - barH, barW, barH);
    }
  }, [profile, isCalibrating, width, height]);

  if (isCalibrating) {
    return (
      <MaterialUI.Box
        sx={{
          width,
          height,
          border: '2px solid #1976d2',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MaterialUI.Typography variant="caption" sx={{ color: '#1976d2', fontSize: '0.65rem' }}>
          Recording…
        </MaterialUI.Typography>
      </MaterialUI.Box>
    );
  }

  if (!profile) {
    return (
      <MaterialUI.Box
        sx={{
          width,
          height,
          border: '1px dashed',
          borderColor: 'text.disabled',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <MaterialUI.Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
          Not calibrated
        </MaterialUI.Typography>
      </MaterialUI.Box>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', flexShrink: 0 }}
    />
  );
};
