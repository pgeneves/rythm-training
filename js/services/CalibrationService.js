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
    this._waveformSamples = [];
    const self = this;

    this._intervalId = setInterval(() => {
      const waveformData = self.audioService.getWaveformData();
      const level = self.accuracyService.calculateAudioLevel(waveformData);
      if (level > self.thresholdLevel) {
        const freqData = self.audioService.getFrequencyData();
        if (freqData && freqData.length > 0) {
          self._samples.push(new Float32Array(freqData));
          self._waveformSamples.push(new Float32Array(waveformData));
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
      this._waveformSamples = [];
      return null;
    }

    const profile = this.frequencyAnalysisService.computeAverageProfile(this._samples);

    const sampleRate = this.audioService.getAudioContext()
      ? this.audioService.getAudioContext().sampleRate
      : 44100;

    const meydaSnapshots = this._waveformSamples
      .map(w => this.frequencyAnalysisService.extractMeydaFeatures(w, sampleRate))
      .filter(Boolean);

    let meydaFeatures = null;
    if (meydaSnapshots.length > 0) {
      const avg = new Float32Array(25);
      for (const feat of meydaSnapshots) {
        for (let i = 0; i < 25; i++) avg[i] += feat[i];
      }
      for (let i = 0; i < 25; i++) avg[i] /= meydaSnapshots.length;

      let norm = 0;
      for (let i = 0; i < 25; i++) norm += avg[i] * avg[i];
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let i = 0; i < 25; i++) avg[i] /= norm;
      }
      meydaFeatures = avg;
    }

    this._samples = [];
    this._waveformSamples = [];
    return { profile, meydaFeatures };
  }
}

window.CalibrationService = CalibrationService;
