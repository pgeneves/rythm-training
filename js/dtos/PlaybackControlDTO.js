class PlaybackControlDTO {
  constructor(tempo, threshold, activeBeats) {
    this.tempo = tempo;
    this.threshold = threshold;
    this.activeBeats = activeBeats;
  }

  static create(state) {
    return new PlaybackControlDTO(
      state.tempo,
      state.threshold,
      state.activeBeats
    );
  }
}

window.PlaybackControlDTO = PlaybackControlDTO;
