class AnimationService {
  constructor() {
    this.animationFrameId = null;
    this.callbacks = {};
    this.previousBeat = -1;
    this.isRunning = false;
  }

  start(callbacks) {
    if (this.isRunning) {
      console.warn('AnimationService: Already running');
      return;
    }

    this.callbacks = callbacks;
    this.previousBeat = -1;
    this.isRunning = true;

    const animate = () => {
      if (!this.isRunning) return;

      if (this.callbacks.onFrame) {
        this.callbacks.onFrame();
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  stop() {
    this.isRunning = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.callbacks = {};
    this.previousBeat = -1;
  }

  detectBeatTransition(currentBeat) {
    const transition = {
      occurred: false,
      previousBeat: this.previousBeat,
      currentBeat: currentBeat
    };

    if (currentBeat !== this.previousBeat && this.previousBeat !== -1) {
      transition.occurred = true;
    }

    this.previousBeat = currentBeat;

    return transition;
  }

  reset() {
    this.previousBeat = -1;
  }
}

window.AnimationService = AnimationService;
