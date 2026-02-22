class CalibrationService {
  constructor(audioService, frequencyAnalysisService) {
    this.audioService = audioService;
    this.frequencyAnalysisService = frequencyAnalysisService;
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

    this._intervalId = setInterval(() => {
      //   const waveformData = this.audioService.getWaveformData();

      const freqData = this.audioService.getFrequencyData();
      if (freqData && freqData.length > 0) {
        this._samples.push(new Float32Array(freqData));
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
