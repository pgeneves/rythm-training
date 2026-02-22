class FrequencyAnalysisService {
  constructor() {
    this.PROFILE_BINS = 128;
  }

  getFrequencyBinCount(analyserFftSize) {
    return analyserFftSize / 2;
  }

  /**
   * Returns the raw bin range (in the full 1024-bin space) to zero out
   * for a given tick frequency, covering ±10 bins around the fundamental.
   * @param {number} tickFrequency - Hz
   * @param {number} sampleRate - e.g. 44100
   * @param {number} fftSize - e.g. 2048
   * @returns {{ start: number, end: number }}
   */
  getTickExclusionRange(tickFrequency, sampleRate, fftSize = 2048) {
    const hzPerBin = sampleRate / fftSize;
    const centerBin = Math.round(tickFrequency / hzPerBin);
    const halfBins = 10;
    return {
      start: Math.max(0, centerBin - halfBins),
      end: Math.min(fftSize / 2 - 1, centerBin + halfBins),
    };
  }

  /**
   * Takes an array of Float32Array FFT snapshots (dB values), downsamples to
   * PROFILE_BINS, averages them, and L2-normalises the result.
   * @param {Float32Array[]} samplesArray
   * @param {{ start: number, end: number } | null} excludeRange - raw bins to zero out
   * @returns {Float32Array}
   */
  computeAverageProfile(samplesArray, excludeRange = null) {
    if (!samplesArray || samplesArray.length === 0) return new Float32Array(this.PROFILE_BINS);

    const fullBins = samplesArray[0].length;
    const groupSize = Math.floor(fullBins / this.PROFILE_BINS);

    const sum = new Float32Array(this.PROFILE_BINS);
    for (const snapshot of samplesArray) {
      for (let b = 0; b < this.PROFILE_BINS; b++) {
        let groupSum = 0;
        const start = b * groupSize;
        const end = Math.min(start + groupSize, fullBins);
        for (let j = start; j < end; j++) {
          // Skip bins in the exclusion range
          if (excludeRange && j >= excludeRange.start && j <= excludeRange.end) {
            continue;
          }
          // dB values are typically negative; shift to positive energy
          groupSum += snapshot[j] + 160; // shift range [-160,0] -> [0,160]
        }
        sum[b] += groupSum / (end - start);
      }
    }

    const profile = new Float32Array(this.PROFILE_BINS);
    for (let b = 0; b < this.PROFILE_BINS; b++) {
      profile[b] = sum[b] / samplesArray.length;
    }

    // L2 normalise to unit vector
    let norm = 0;
    for (let b = 0; b < this.PROFILE_BINS; b++) {
      norm += profile[b] * profile[b];
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let b = 0; b < this.PROFILE_BINS; b++) {
        profile[b] /= norm;
      }
    }

    return profile;
  }

  /**
   * Dot product of two unit vectors (cosine similarity when both are L2-normalised).
   * @param {Float32Array} a
   * @param {Float32Array} b
   * @returns {number} similarity in [0, 1]
   */
  cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
    }
    return Math.max(0, dot);
  }

  /**
   * Downsample raw frequency data (with tick exclusion) and find the best matching layer.
   * @param {Float32Array} frequencyData - raw FFT dB data from analyser (1024 bins)
   * @param {SoundLayerDTO[]} soundLayers
   * @param {number} similarityThreshold
   * @param {{ start: number, end: number } | null} excludeRange
   * @returns {{ layerId: string, similarity: number } | null}
   */
  classifySound(frequencyData, soundLayers, similarityThreshold = 0.65, excludeRange = null) {
    const inputProfile = this.computeAverageProfile([frequencyData], excludeRange);

    let best = null;
    for (const layer of soundLayers) {
      if (!layer.profile) continue;
      const sim = this.cosineSimilarity(inputProfile, layer.profile);
      if (sim >= similarityThreshold) {
        if (!best || sim > best.similarity) {
          best = { layerId: layer.id, similarity: sim };
        }
      }
    }
    return best;
  }
}

window.FrequencyAnalysisService = FrequencyAnalysisService;
