class SoundLayerDTO {
  constructor(id, label, profile, beats, accuracyResults, meydaFeatures, keyBinding) {
    this.id = id;
    this.label = label;
    this.profile = profile;           // Float32Array | null
    this.beats = beats;               // boolean[16]
    this.accuracyResults = accuracyResults; // AccuracyResultDTO[16]
    this.meydaFeatures = meydaFeatures !== undefined ? meydaFeatures : null; // Float32Array(25) | null
    this.keyBinding = keyBinding !== undefined ? keyBinding : null;           // string | null
  }

  static create({ label }) {
    const id = 'layer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return new SoundLayerDTO(
      id,
      label,
      null,
      Array(16).fill(false),
      AccuracyResultDTO.createArray(16),
      null,
      null
    );
  }
}

window.SoundLayerDTO = SoundLayerDTO;
