class AccuracyResultDTO {
  constructor(status = 'neutral', detected = false, level = 0) {
    this.status = status; // 'correct' | 'incorrect' | 'neutral'
    this.detected = detected;
    this.level = level;
  }

  static neutral() {
    return new AccuracyResultDTO('neutral', false, 0);
  }

  static createArray(count) {
    return Array(count).fill(null).map(() => AccuracyResultDTO.neutral());
  }
}

window.AccuracyResultDTO = AccuracyResultDTO;
