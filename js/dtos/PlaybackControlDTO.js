class PlaybackControlDTO {
  constructor(tempo, threshold, soundLayers, tickEnabled, tickFrequency, similarityThreshold) {
    this.tempo = tempo;
    this.threshold = threshold;
    this.soundLayers = soundLayers;
    this.tickEnabled = tickEnabled;
    this.tickFrequency = tickFrequency;
    this.similarityThreshold = similarityThreshold;
  }

  static create(state) {
    return new PlaybackControlDTO(
      state.tempo,
      state.threshold,
      state.soundLayers,
      state.tickEnabled,
      state.tickFrequency,
      state.similarityThreshold
    );
  }
}

window.PlaybackControlDTO = PlaybackControlDTO;
