class VisualizationService {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.beatMarkerHeight = 40;
    this.lastBeat = -1;
    // Store logical dimensions (CSS pixels) for drawing calculations
    // Will be set properly by updateDimensions
    this.width = 800;
    this.height = 300;
  }

  updateDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  clearWaveformArea() {
    const waveformStartY = this.beatMarkerHeight + 30;
    this.ctx.clearRect(
      0,
      waveformStartY,
      this.width,
      this.height - waveformStartY,
    );

    // Redraw center line after clearing
    const waveformHeight = this.height - waveformStartY - 10;
    const waveformCenterY = waveformStartY + waveformHeight / 2;
    this.ctx.strokeStyle = "#ed1111";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, waveformCenterY);
    this.ctx.lineTo(this.width, waveformCenterY);
    this.ctx.stroke();
  }

  clearBeatMarkerArea() {
    this.ctx.clearRect(0, 0, this.width, this.beatMarkerHeight + 25);
  }

  drawBeatMarkers(activeBeats, currentBeat) {
    const beatWidth = this.width / 16;
    const measureSpacing = 10;

    for (let i = 0; i < 16; i++) {
      const x = i * beatWidth;
      const isActive = activeBeats[i];
      const isCurrent = i === currentBeat;

      if (isCurrent) {
        this.ctx.fillStyle = "rgba(33, 150, 243, 0.1)";
        this.ctx.fillRect(x, 0, beatWidth, this.height);
      }

      if (i % 4 === 0 && i > 0) {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        this.ctx.fillRect(
          x - measureSpacing / 2,
          0,
          measureSpacing,
          this.height,
        );
      }

      this.ctx.strokeStyle = isActive ? "#4caf50" : "#bdbdbd";
      this.ctx.lineWidth = isActive ? 3 : 1;

      this.ctx.beginPath();
      this.ctx.moveTo(x + beatWidth / 2, 0);
      this.ctx.lineTo(x + beatWidth / 2, this.beatMarkerHeight);
      this.ctx.stroke();

      this.ctx.fillStyle = isCurrent ? "#ccdf4d" : "#757575";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        (i + 1).toString(),
        x + beatWidth / 2,
        this.beatMarkerHeight + 15,
      );
    }
  }

  drawWaveform(waveformData, currentBeat) {
    if (!waveformData || waveformData.length === 0) {
      return;
    }

    const beatWidth = this.width / 16;
    const waveformStartY = this.beatMarkerHeight + 30;
    const waveformHeight = this.height - waveformStartY - 10;
    const waveformCenterY = waveformStartY + waveformHeight / 2;

    const beatStartX = currentBeat * beatWidth;
    const beatEndX = (currentBeat + 1) * beatWidth;

    this.ctx.strokeStyle = "#f321d4";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    const sliceWidth = beatWidth / waveformData.length;

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i];
      // Amplify the waveform for better visibility
      const y = waveformCenterY + v * waveformHeight * 0.8;
      const x = beatStartX + i * sliceWidth;

      if (x >= beatEndX) break;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }

    this.ctx.stroke();
  }

  draw(waveformData, activeBeats, currentBeat) {
    // Detect loop back to beat 0 or first draw
    if (currentBeat === 0 && (this.lastBeat === 15 || this.lastBeat === -1)) {
      this.clearWaveformArea();
    }

    // Always clear and redraw beat markers
    this.clearBeatMarkerArea();
    this.drawBeatMarkers(activeBeats, currentBeat);

    // Draw waveform (accumulates across beats)
    this.drawWaveform(waveformData, currentBeat);

    this.lastBeat = currentBeat;
  }
}
