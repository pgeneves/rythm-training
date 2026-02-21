const VisualizationPanel = ({ visualizationServiceRef, isPlaying }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      const logicalWidth = rect.width;
      const logicalHeight = 300;

      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;

      canvas.style.width = logicalWidth + 'px';
      canvas.style.height = logicalHeight + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      // Initialize service if not exists
      if (!visualizationServiceRef.current) {
        visualizationServiceRef.current = new VisualizationService(canvas);
        visualizationServiceRef.current.updateDimensions(logicalWidth, logicalHeight);
      } else {
        visualizationServiceRef.current.canvas = canvas;
        visualizationServiceRef.current.ctx = ctx;
        visualizationServiceRef.current.updateDimensions(logicalWidth, logicalHeight);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visualizationServiceRef]);

  return (
    <MaterialUI.Box className="panel-container">
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '300px'
        }}
      />
    </MaterialUI.Box>
  );
};
