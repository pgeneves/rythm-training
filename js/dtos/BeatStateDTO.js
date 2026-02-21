class BeatStateDTO {
  constructor(currentBeat, activeBeats, accuracyResults) {
    this.currentBeat = currentBeat;
    this.activeBeats = activeBeats;
    this.accuracyResults = accuracyResults;
  }

  static create(state) {
    return new BeatStateDTO(
      state.currentBeat,
      state.activeBeats,
      state.accuracyResults
    );
  }
}

window.BeatStateDTO = BeatStateDTO;
