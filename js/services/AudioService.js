class AudioService {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.highPassFilter = null;
    this.dataArray = null;
    this.stream = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = "highpass";
      this.highPassFilter.frequency.value = 120;

      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.highPassFilter);
      this.highPassFilter.connect(this.analyser);

      this.dataArray = new Float32Array(this.analyser.fftSize);
      this.initialized = true;

      return { success: true };
    } catch (error) {
      console.error("Microphone initialization failed:", error);
      return {
        success: false,
        error:
          error.name === "NotAllowedError"
            ? "Microphone permission denied. Please allow microphone access and reload."
            : "Failed to initialize microphone: " + error.message,
      };
    }
  }

  getWaveformData() {
    if (!this.initialized || !this.analyser) {
      return new Float32Array(2048);
    }

    this.analyser.getFloatTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  getFrequencyData() {
    if (!this.initialized || !this.analyser) return new Float32Array(1024);
    const freqArray = new Float32Array(this.analyser.frequencyBinCount);
    this.analyser.getFloatFrequencyData(freqArray);
    return freqArray;
  }

  getAudioContext() {
    return this.audioContext;
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.initialized = false;
  }

  isInitialized() {
    return this.initialized;
  }
}
