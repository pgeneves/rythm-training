class BeatStateDTO {
  constructor(currentBeat, soundLayers) {
    this.currentBeat = currentBeat;
    this.soundLayers = soundLayers;
  }

  static create(state) {
    return new BeatStateDTO(
      state.currentBeat,
      state.soundLayers
    );
  }
}

window.BeatStateDTO = BeatStateDTO;
