# Rythme Training — Context Memory

**Status:** Goals 1–8 complete
**Stack:** React 18 (UMD/Babel in-browser, no build step), Material UI v5, Web Audio API, Meyda.js, Canvas 2D

---

## File Structure

```
index.html                      # loads all scripts in order (see Load Order)
css/styles.css                  # CSS variables + utility classes
lib/                            # local UMD builds (React, ReactDOM, Emotion, MUI, Babel, Meyda)
js/
  app.js                        # root component, all state, all handlers
  services/
    AudioService.js             # mic capture, highpass filter, analyser
    BeatService.js              # drift-free tempo tracking via performance.now()
    AccuracyService.js          # RMS level calc, per-layer accuracy evaluation
    AnimationService.js         # rAF loop, beat transition detection
    AppStateService.js          # layer accuracy initialisation and update helpers
    VisualizationService.js     # canvas waveform + beat markers
    FrequencyAnalysisService.js # FFT profile, Meyda features, cosine similarity, classifySound
    CalibrationService.js       # 50ms capture loop (energy-gated), returns {profile, meydaFeatures}
    MetronomeService.js         # OscillatorNode click at bar starts
  dtos/
    SoundLayerDTO.js            # main layer model (see below)
    BeatStateDTO.js             # {currentBeat, soundLayers} — passed to AccuracyFeedback
    AccuracyResultDTO.js        # {status, detected, level} — .neutral(), .createArray()
  components/
    ProfileChart.js             # 128-bin bar chart canvas; liveData/isMatched for test mode
    ThresholdInput.js           # Min. Energy Level (noise gate, default 0.0021)
    SimilarityThresholdInput.js # cosine similarity threshold (default 0.85)
    TempoInput.js               # BPM input
    TickFrequencyInput.js       # metronome tick Hz
    AccuracyFeedback.js         # 16-cell beat accuracy display
    VisualizationPanel.js       # canvas wrapper for waveform
    InstrumentLayerRow.js       # REC + label + ProfileChart + key binding + delete
    SoundLayerRow.js            # read-only label + 16-beat grid (Patterns tab)
  components/tabs/
    InstrumentsTab.js           # test row + list of InstrumentLayerRow + Add button
    PatternsTab.js              # one SoundLayerRow per layer
    ExerciseTab.js              # tempo + tick + start/stop + visualization + accuracy
```

Retired (files on disk, not loaded in index.html): `ControlHeader.js`, `MultiLayerBeatSelector.js`, `PlaybackControlDTO.js`

---

## Load Order (index.html script tags)

React → ReactDOM → Emotion → MUI → Babel → Meyda → Services → AccuracyResultDTO → SoundLayerDTO → BeatStateDTO → Components → app.js

AccuracyResultDTO must load before SoundLayerDTO (SoundLayerDTO.create references it).

---

## SoundLayerDTO

The central data model, held in React state as an array:

- `id` — unique string
- `label` — user-editable name
- `beats[16]` — boolean pattern
- `accuracyResults[16]` — AccuracyResultDTO per beat
- `profile` — Float32Array(128) | null — calibrated FFT fingerprint
- `meydaFeatures` — Float32Array(25) | null — MFCC(13) + Chroma(12), L2-normalised
- `keyBinding` — string | null — key for manual mode

A layer is "uncalibrated" when profile, meydaFeatures, and keyBinding are all null.

---

## Audio Chain

Microphone → BiquadFilter (highpass, 70 Hz) → AnalyserNode (fftSize 2048)

AudioService exposes: `getWaveformData()`, `getFrequencyData()`, `getAudioContext()`, `initialize()`, `stop()`

---

## Sound Classification (FrequencyAnalysisService)

`classifySound(freqData, waveformData, layers, similarityThreshold, excludeRange, sampleRate)`

1. Compute 128-bin L2-normalised FFT profile from freqData
2. Extract Meyda features from waveformData (if available)
3. For each calibrated layer: use Meyda cosine similarity if layer has meydaFeatures + input has Meyda; else FFT cosine similarity
4. Return best match above similarityThreshold, or null

`computeAverageProfile(snapshots[])` — averages, sharpens (zero below mean, double above), L2-normalises
`extractMeydaFeatures(waveformData, sampleRate)` — returns Float32Array(25) or null
`getTickExclusionRange(tickHz, sampleRate)` — ±10 bins around tick fundamental

---

## Noise Gate (Energy Threshold)

The **Min. Energy Level** input (ThresholdInput) controls `threshold` (default 0.0021).
Applied consistently in all three contexts:

- **Calibration** — CalibrationService only captures a snapshot when `RMS > thresholdLevel`
- **Exercise** — animation loop: `soundDetected = RMS > threshold`; freq data only fetched when detected
- **Test mode** — 50ms interval: if `RMS < threshold`, clear chart and match, return early

---

## Tab Structure

**Tab 0 — Instruments**
- Min. Energy Level + Similarity Threshold inputs
- **Test row** (single): TEST/⏹ button, "Live Input" label, ProfileChart (live bars → green on match), matched layer chip
- One InstrumentLayerRow per layer: REC/Stop button, editable label, ProfileChart (calibrated profile), key binding chip, delete

**Tab 1 — Patterns**
- One SoundLayerRow per layer: read-only label + 16-beat toggle grid

**Tab 2 — Exercise**
- TempoInput, metronome tick checkbox + TickFrequencyInput, Start/Stop
- VisualizationPanel (waveform canvas)
- AccuracyFeedback (16 colored cells)

---

## app.js State

| State | Default | Purpose |
|---|---|---|
| soundLayers | 2 layers | array of SoundLayerDTO |
| isPlaying | false | exercise running |
| currentBeat | 0 | 0–15 |
| tempo | 60 | BPM |
| threshold | 0.0021 | noise gate (Min. Energy Level) |
| similarityThreshold | 0.85 | cosine match cutoff |
| tickEnabled | true | metronome on/off |
| tickFrequency | 1000 | metronome Hz |
| calibrationState | {isRecording, targetLayerId} | per-layer calibration |
| isTesting | false | test mode active |
| liveFreqData | null | Float32Array(128) for test chart |
| matchedLayerId | null | currently matched layer in test |
| audioInitialized | false | mic permission granted |
| activeTab | 0 | 0/1/2 |
| error | null | displayed in Alert |

Key refs (avoid stale closures in loops): `soundLayersRef`, `thresholdRef`, `similarityThresholdRef`, `tickEnabledRef`, `tickFrequencyRef`

---

## Key Patterns & Constraints

- All services stored in `useRef`, created once on mount, exposed to `window` global scope
- Animation loop reads `soundLayersRef.current` not state (stale closure protection)
- Test mode auto-stops when exercise starts (`useEffect([isPlaying])`)
- Manual mode: `keydown` listener active only while playing; `manualHitsRef` (Set) accumulates hits, cleared after each beat transition
- Metronome fires at beats 0, 4, 8, 12 (bar starts only)
- Calibration requires ≥ 3 captured samples; returns null otherwise
- ProfileChart: `liveData` takes priority over `profile`; bars are green when `isMatched && liveData != null`
- ThresholdInput: HTML allows up to 0.8 but clamping logic uses 0.0001–0.5

---

## Calibration Flow

1. User clicks REC → CalibrationService.startRecording() → 50ms interval capturing energy-gated FFT + waveform snapshots
2. User clicks Stop → stopRecording() → computeAverageProfile(snapshots) + average Meyda features → stored on layer as {profile, meydaFeatures}
3. ProfileChart shows the calibrated fingerprint

## Test Flow

1. User clicks TEST in the test row → audio initialised if needed → `isTesting = true`
2. 50ms interval: RMS check → if below threshold: clear chart + match; else: compute profile → setLiveFreqData → classifySound → setMatchedLayerId
3. Test chart shows live bars (blue), turns green when a layer matches; matched layer name appears as chip

## Exercise Flow

1. Start → audio init → layers accuracy reset → animation loop starts
2. Each rAF frame: get beat, detect transition
3. On transition: RMS check → if sound detected: getFrequencyData → classifySound (with tick exclusion range) → per-layer accuracy evaluation (keyBinding layers use manual hit set, audio layers use detectedLayerId)
4. manualHitsRef cleared after each transition; setCurrentBeat + visualization draw every frame

---

*Last updated: 2026-03-01 — Goal 8 complete*
