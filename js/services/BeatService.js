class BeatService {
  constructor(tempo = 120) {
    this.tempo = tempo;
    this.startTime = null;
    this.beatDuration = this.calculateBeatDuration();
    this.isRunning = false;
  }

  calculateBeatDuration() {
    return ((60 / this.tempo) * 1000) / 4; // 4 beats per tempo pulsation
  }

  start() {
    this.startTime = performance.now();
    this.beatDuration = this.calculateBeatDuration();
    this.isRunning = true;
  }

  stop() {
    this.isRunning = false;
    this.startTime = null;
  }

  getCurrentBeat() {
    if (!this.isRunning || this.startTime === null) {
      return 0;
    }

    const elapsed = performance.now() - this.startTime;
    const totalBeats = Math.floor(elapsed / this.beatDuration);
    return totalBeats % 16;
  }

  setTempo(newTempo) {
    if (newTempo < 40 || newTempo > 240) {
      return;
    }

    if (this.isRunning && this.startTime !== null) {
      const elapsed = performance.now() - this.startTime;
      const beatsElapsed = elapsed / this.beatDuration;

      this.tempo = newTempo;
      this.beatDuration = this.calculateBeatDuration();

      this.startTime = performance.now() - beatsElapsed * this.beatDuration;
    } else {
      this.tempo = newTempo;
      this.beatDuration = this.calculateBeatDuration();
    }
  }

  getTempo() {
    return this.tempo;
  }
}
