class CalibrationService {
  constructor(
    audioService,
    accuracyService,
    frequencyAnalysisService,
    thresholdLevel,
  ) {
    this.audioService = audioService;
    this.accuracyService = accuracyService;
    this.frequencyAnalysisService = frequencyAnalysisService;
    this.thresholdLevel = thresholdLevel;
    this._isRecording = false;
    this._samples = [];
    this._intervalId = null;
  }

  get isRecording() {
    return this._isRecording;
  }

  startRecording() {
    this._isRecording = true;
    this._samples = [];
    const self = this;

    this._intervalId = setInterval(() => {
      const waveformData = self.audioService.getWaveformData();
      const level = self.accuracyService.calculateAudioLevel(waveformData);
      if (level > self.thresholdLevel) {
        const freqData = self.audioService.getFrequencyData();
        if (freqData && freqData.length > 0) {
          this._samples.push(new Float32Array(freqData));
        }
      }
    }, 50);
  }

  stopRecording() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
    this._isRecording = false;

    if (this._samples.length < 3) {
      this._samples = [];
      return null;
    }

    const profile = this.frequencyAnalysisService.computeAverageProfile(
      this._samples,
    );
    this._samples = [];
    return profile;
  }
}

window.CalibrationService = CalibrationService;
