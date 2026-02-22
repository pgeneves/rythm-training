class AccuracyService {
  constructor() {
    // Service is stateless - all logic is in pure methods
  }

  /**
   * Calculate RMS (Root Mean Square) audio level from waveform data
   * @param {Float32Array} waveformData - Time domain audio samples
   * @returns {number} RMS level (0.0 to ~1.0)
   */
  calculateAudioLevel(waveformData) {
    if (!waveformData || waveformData.length === 0) {
      return 0;
    }

    let sumOfSquares = 0;
    for (let i = 0; i < waveformData.length; i++) {
      sumOfSquares += waveformData[i] * waveformData[i];
    }

    const rms = Math.sqrt(sumOfSquares / waveformData.length);
    return rms;
  }

  /**
   * Evaluate accuracy for a beat based on whether sound was detected
   * @param {boolean} beatWasActive - Whether the beat should have been played
   * @param {boolean} soundDetected - Whether sound was detected (level > threshold)
   * @param {number} level - The audio level that was measured
   * @returns {object} Result with status ('correct', 'incorrect', 'neutral'), detected, and level
   */
  evaluateAccuracy(beatWasActive, soundDetected, level) {
    let status;

    if (beatWasActive && soundDetected) {
      // Active beat + sound detected → CORRECT (green)
      status = 'correct';
    } else if (beatWasActive && !soundDetected) {
      // Active beat + no sound → INCORRECT (red) - missed beat
      status = 'incorrect';
    } else if (!beatWasActive && soundDetected) {
      // Inactive beat + sound detected → INCORRECT (red) - played when shouldn't
      status = 'incorrect';
    } else {
      // Inactive beat + no sound → CORRECT (green) - correctly silent
      status = 'correct';
    }

    return {
      status,
      detected: soundDetected,
      level
    };
  }

  /**
   * Evaluate accuracy for a specific sound layer.
   * Returns neutral if the layer is uncalibrated or the beat is inactive.
   * @param {SoundLayerDTO} layer
   * @param {number} beatIndex - the beat slot being evaluated (previousBeat)
   * @param {string|null} detectedLayerId - id of the best-matched layer, or null
   * @param {boolean} soundDetected - whether any sound crossed the threshold
   * @returns {object} AccuracyResultDTO-compatible object
   */
  evaluateLayerAccuracy(layer, beatIndex, detectedLayerId, soundDetected) {
    if (!layer.profile) return AccuracyResultDTO.neutral();
    const beatWasActive = layer.beats[beatIndex];
    if (!beatWasActive) return AccuracyResultDTO.neutral();
    if (soundDetected && detectedLayerId === layer.id) {
      return { status: 'correct', detected: true, level: 0 };
    }
    return { status: 'incorrect', detected: soundDetected, level: 0 };
  }
}
