class AppStateService {
  constructor() {
    this.beatCount = 16;
  }

  initializePlaybackState() {
    return {
      accuracyResults: this.resetAccuracyResults(this.beatCount),
      currentBeat: 0
    };
  }

  resetAccuracyResults(count = this.beatCount) {
    return Array(count).fill(null).map(() => ({
      status: 'neutral',
      detected: false,
      level: 0
    }));
  }

  processAccuracyUpdate(prevResults, beatIndex, newResult) {
    if (beatIndex < 0 || beatIndex >= prevResults.length) {
      console.warn(`AppStateService: Invalid beat index ${beatIndex}`);
      return prevResults;
    }

    const newResults = [...prevResults];
    newResults[beatIndex] = newResult;
    return newResults;
  }

  initializeLayersAccuracy(soundLayers) {
    return soundLayers.map(layer => ({
      ...layer,
      accuracyResults: this.resetAccuracyResults(16)
    }));
  }

  processLayerAccuracyUpdate(soundLayers, layerId, beatIndex, result) {
    return soundLayers.map(layer => {
      if (layer.id !== layerId) return layer;
      const newResults = [...layer.accuracyResults];
      newResults[beatIndex] = result;
      return { ...layer, accuracyResults: newResults };
    });
  }

  setBeatCount(count) {
    this.beatCount = count;
  }

  getBeatCount() {
    return this.beatCount;
  }
}

window.AppStateService = AppStateService;
