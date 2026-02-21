const ControlHeader = ({ playbackControl, onTempoChange, onThresholdChange, onBeatToggle }) => {
  return (
    <MaterialUI.Box className="flex-center-column gap-md mb-lg">
      <MaterialUI.Box className="flex-center-row gap-md">
        <TempoInput tempo={playbackControl.tempo} onChange={onTempoChange} />
        <ThresholdInput threshold={playbackControl.threshold} onChange={onThresholdChange} />
      </MaterialUI.Box>
      <BeatSelector activeBeats={playbackControl.activeBeats} onToggle={onBeatToggle} />
    </MaterialUI.Box>
  );
};
