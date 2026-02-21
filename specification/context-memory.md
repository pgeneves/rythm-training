# Rythme Training - Technical Context & Memory

## Project Overview
A browser-based rhythm training application that provides real-time microphone visualization synchronized with a customizable 16-beat pattern. Built with vanilla React 18 (no build step) and Material UI, using Web Audio API for audio capture and Canvas 2D for visualization.

## Technical Stack

### Core Technologies
- **React 18** - Loaded via UMD build, JSX transformed in-browser with Babel
- **Material UI v5** - Component library (UMD build)
- **Emotion** - CSS-in-JS styling (required by Material UI)
- **Web Audio API** - Microphone capture and audio analysis
- **Canvas 2D API** - Real-time waveform visualization
- **Babel Standalone** - In-browser JSX transformation

### No Build Step Architecture
- All libraries loaded via CDN/local UMD builds
- JSX files marked with `type="text/babel"` for in-browser transformation
- No webpack, Vite, or other bundlers
- Development and production code are identical
- Browser compatibility: Modern browsers with Web Audio API support

## Architecture

### Directory Structure
```
rythme-training/
├── index.html              # Entry point, loads all scripts
├── css/
│   └── styles.css          # Global styles, CSS variables, utility classes
├── lib/                    # Third-party libraries (UMD builds)
│   ├── react.development.js
│   ├── react-dom.development.js
│   ├── emotion-react.umd.min.js
│   ├── emotion-styled.umd.min.js
│   ├── material-ui.development.js
│   └── babel.min.js
├── specification/          # Project documentation
│   └── context-memory.md
└── js/
    ├── app.js              # Main application component
    ├── services/           # Business logic layer
    │   ├── AudioService.js
    │   ├── BeatService.js
    │   ├── VisualizationService.js
    │   ├── AccuracyService.js
    │   ├── AnimationService.js
    │   └── AppStateService.js
    ├── dtos/               # Data Transfer Objects
    │   ├── PlaybackControlDTO.js
    │   ├── BeatStateDTO.js
    │   └── AccuracyResultDTO.js
    └── components/         # UI components
        ├── ControlHeader.js
        ├── TempoInput.js
        ├── ThresholdInput.js
        ├── BeatSelector.js
        ├── VisualizationPanel.js
        └── AccuracyFeedback.js
```

### Architectural Principles
1. **Separation of Concerns** - Business logic in services, UI logic in components
2. **Service-Oriented Design** - Core functionality encapsulated in reusable service classes
3. **DTO Pattern** - Structured data contracts between components using Data Transfer Objects
4. **CSS Utility Classes** - Reusable CSS patterns with CSS variables for consistency
5. **Minimal Component Logic** - Components handle only presentation and user interaction
6. **Ref-Based Service Management** - Service instances stored in `useRef` to persist across renders
7. **State-Driven UI** - React state triggers re-renders, services provide data

## Component Architecture

### App.js (Root Component)
**Responsibilities:**
- State management (tempo, threshold, activeBeats, isPlaying, currentBeat, accuracyResults, audioInitialized, error)
- Service orchestration (creates and manages service instances)
- DTO creation (PlaybackControlDTO, BeatStateDTO for component props)
- User interaction handling (start/stop, tempo changes, threshold changes, beat toggles)

**State:**
```javascript
const [tempo, setTempo] = useState(120);              // Current BPM (40-240)
const [threshold, setThreshold] = useState(0.02);     // Detection threshold (0.001-0.5)
const [activeBeats, setActiveBeats] = useState([...]);// Array(16) of booleans
const [isPlaying, setIsPlaying] = useState(false);    // Playback state
const [currentBeat, setCurrentBeat] = useState(0);    // Position 0-15
const [accuracyResults, setAccuracyResults] = useState([...]); // Array(16) of accuracy objects
const [audioInitialized, setAudioInitialized] = useState(false);
const [error, setError] = useState(null);             // Error messages
```

**Service Refs:**
```javascript
const audioServiceRef = useRef(null);          // AudioService instance
const beatServiceRef = useRef(null);           // BeatService instance
const visualizationServiceRef = useRef(null);  // VisualizationService instance
const accuracyServiceRef = useRef(null);       // AccuracyService instance
const animationServiceRef = useRef(null);      // AnimationService instance
const appStateServiceRef = useRef(null);       // AppStateService instance
```

**DTO Creation:**
```javascript
const playbackControl = PlaybackControlDTO.create({ tempo, threshold, activeBeats });
const beatState = BeatStateDTO.create({ currentBeat, activeBeats, accuracyResults });
```

### Component Hierarchy
```
App
├── Container (Material UI)
│   └── Paper
│       ├── Typography (Title + Subtitle)
│       ├── Alert (Error messages)
│       ├── ControlHeader (receives PlaybackControlDTO)
│       │   ├── TempoInput
│       │   ├── ThresholdInput
│       │   └── BeatSelector (16 ToggleButtons)
│       ├── Button Group (Start/Stop)
│       ├── VisualizationPanel
│       │   └── Canvas
│       ├── AccuracyFeedback (receives BeatStateDTO)
│       └── Typography (Status: beat/tempo display)
```

### Component Details

#### ControlHeader.js
- Pure presentation component
- **Props**: `playbackControl` (PlaybackControlDTO), `onTempoChange`, `onThresholdChange`, `onBeatToggle`
- Lays out TempoInput, ThresholdInput, and BeatSelector
- Uses CSS utility classes: `flex-center-column`, `gap-md`, `mb-lg`
- Extracts tempo, threshold, activeBeats from DTO and passes to children

#### TempoInput.js
- Material UI TextField (type="number")
- Validation: min=40, max=240
- Local state for immediate input feedback
- Clamps values on blur
- Uses CSS class: `input-fixed-width` (150px)
- Calls `onChange` callback with clamped value

#### ThresholdInput.js
- Material UI TextField (type="number")
- Validation: min=0.001, max=0.5
- Local state for immediate input feedback
- Clamps values on blur
- Uses CSS class: `input-fixed-width` (150px)
- Calls `onChange` callback with clamped value

#### BeatSelector.js
- 16 Material UI ToggleButtons
- Grouped into 4 measures (visual spacing between groups)
- Numbered 1-16 for user display
- Uses CSS class: `flex-wrap-center`, `gap-sm`
- Toggles beat state via `onToggle(beatIndex)` callback
- Active beats show as "selected" (blue), inactive as gray

#### VisualizationPanel.js
- Canvas wrapper with responsive sizing
- Device pixel ratio scaling for retina displays
- Handles window resize events
- Uses CSS class: `panel-container`
- Passes canvas reference to VisualizationService
- Updates service reference when canvas is ready

#### AccuracyFeedback.js
- **Props**: `beatState` (BeatStateDTO)
- Displays 16 boxes showing accuracy for each beat
- Color coding: Green (correct), Red (incorrect), Gray (neutral)
- Current beat highlighted with blue border and shadow
- Measure spacing (groups of 4 beats)
- Uses CSS classes: `accuracy-feedback-item`, `current`
- Extracts accuracyResults, activeBeats, currentBeat from DTO

## Service Layer

### AudioService.js
**Purpose:** Web Audio API abstraction for microphone capture

**Key Methods:**
- `async initialize()` - Requests microphone permission via getUserMedia
- `getWaveformData()` - Returns Float32Array of time-domain audio data
- `stop()` - Cleanup: stops media stream and closes audio context
- `isInitialized()` - Returns initialization status

**Implementation Details:**
- AudioContext with AnalyserNode (fftSize: 2048)
- smoothingTimeConstant: 0.8 (smoothed waveform)
- Disables echo cancellation, noise suppression, auto gain for raw audio
- Error handling for permission denial and device access failures
- Returns success/error object for user feedback

**Audio Chain:**
```
Microphone → MediaStreamSource → AnalyserNode → getFloatTimeDomainData()
```

### BeatService.js
**Purpose:** High-precision tempo-based timing without drift

**Key Methods:**
- `start()` - Records start time with `performance.now()`
- `getCurrentBeat()` - Calculates current beat position (0-15)
- `setTempo(newTempo)` - Updates tempo, preserves phase during playback
- `stop()` - Stops beat tracking

**Timing Algorithm:**
```javascript
beatDuration = (60 / tempo) * 1000;  // milliseconds per beat
elapsed = performance.now() - startTime;
totalBeats = Math.floor(elapsed / beatDuration);
currentBeat = totalBeats % 16;  // Loop every 16 beats
```

**Key Features:**
- Uses `performance.now()` for sub-millisecond precision
- No drift accumulation (unlike setInterval)
- Tempo changes preserve musical phase (beat position maintained)
- 16-beat loop (4 measures × 4 beats)

### AccuracyService.js
**Purpose:** Audio level calculation and accuracy evaluation

**Key Methods:**
- `calculateAudioLevel(waveformData)` - Computes RMS (root mean square) of audio signal
- `evaluateAccuracy(isBeatActive, soundDetected, level)` - Evaluates if user played correctly
- Returns accuracy object: `{ status: 'correct'|'incorrect'|'neutral', detected: boolean, level: number }`

**Evaluation Logic:**
```javascript
if (isBeatActive && soundDetected) return 'correct';    // Should play, did play
if (isBeatActive && !soundDetected) return 'incorrect'; // Should play, didn't play
if (!isBeatActive && soundDetected) return 'incorrect'; // Shouldn't play, did play
return 'neutral';                                       // Shouldn't play, didn't play
```

**Audio Level Calculation:**
- Uses RMS (Root Mean Square) for amplitude measurement
- More accurate than simple peak detection
- Threshold-based detection (default: 0.02)

### AnimationService.js
**Purpose:** Animation loop orchestration and beat transition detection

**Key Methods:**
- `start(callbacks)` - Starts animation loop with registered callbacks
- `stop()` - Stops animation and cleans up
- `detectBeatTransition(currentBeat)` - Detects when beat changes, returns transition object
- `reset()` - Resets beat tracking (previousBeat = -1)

**Transition Detection:**
```javascript
{
  occurred: boolean,      // true if beat changed since last call
  previousBeat: number,   // the beat we just left
  currentBeat: number     // the beat we're now on
}
```

**Design Benefits:**
- Centralizes animation loop management (was scattered in App.js)
- Provides clean callback interface for frame updates
- Handles beat transition detection logic
- Manages requestAnimationFrame lifecycle

### AppStateService.js
**Purpose:** Application state initialization and management

**Key Methods:**
- `initializePlaybackState()` - Returns initial state object for playback start
- `resetAccuracyResults(count)` - Creates fresh array of neutral accuracy results
- `processAccuracyUpdate(prevResults, beatIndex, newResult)` - Immutable accuracy update

**State Management:**
- Centralizes state initialization logic (was in handleStart)
- Provides immutable update helpers
- Ensures consistent state structure
- Manages beat count configuration (default: 16)

### VisualizationService.js
**Purpose:** Canvas 2D rendering of waveform and beat markers

**Key Methods:**
- `draw(waveformData, activeBeats, currentBeat)` - Master draw call
- `drawBeatMarkers(activeBeats, currentBeat)` - Draws 16 vertical lines
- `drawWaveform(waveformData, currentBeat)` - Draws audio waveform
- `clear()` - Clears canvas

**Rendering Strategy:**
```
Canvas Layout (16 sections, one per beat):
┌─────────────────────────────────────────────┐
│  1  2  3  4  │  5  6  7  8  │  9 10 11 12 │ 13 14 15 16  ← Beat markers
│  ▕  ▕  ▕  ▕  │  ▕  ▕  ▕  ▕  │  ▕  ▕  ▕  ▕  │  ▕  ▕  ▕  ▕
│  ╱╲╱╲╲╱╲╱    │              │  ╲╱╲╱╲╱      │              ← Waveform
│  ^current    │              │              │              ← Current beat highlight
└─────────────────────────────────────────────┘
```

**Visual Elements:**
1. **Beat Markers** (top section):
   - Vertical lines at each beat boundary
   - Active beats: thick green lines (3px)
   - Inactive beats: thin gray lines (1px)
   - Beat numbers (1-16) displayed below markers

2. **Current Beat Highlight**:
   - Light blue background fill for current beat section
   - Updates 60 times per second

3. **Measure Spacing**:
   - Gray dividers between 4-beat groups
   - Visual grouping: 4 measures clearly separated

4. **Waveform** (lower section):
   - Blue line (2px) plotting audio amplitude
   - Horizontal center line (gray, 1px) as zero reference
   - Waveform drawn within current beat section only
   - Clears on next beat for scrolling effect

**Coordinate System:**
- Beat marker height: 40px from top
- Waveform starts: 70px from top (beatMarkerHeight + 30px)
- Waveform uses remaining canvas height

## DTO Layer

### PlaybackControlDTO.js
**Purpose:** Encapsulates playback control state for component communication

**Properties:**
```javascript
{
  tempo: number,        // BPM (40-240)
  threshold: number,    // Detection threshold (0.001-0.5)
  activeBeats: boolean[] // Array(16) of beat states
}
```

**Usage:**
- Passed to ControlHeader component
- Reduces prop drilling from 6 props to 1 DTO + 3 callbacks
- Provides static factory method: `PlaybackControlDTO.create(state)`

### BeatStateDTO.js
**Purpose:** Encapsulates beat visualization state

**Properties:**
```javascript
{
  currentBeat: number,           // Current beat position (0-15)
  activeBeats: boolean[],        // Array(16) of beat states
  accuracyResults: AccuracyResult[] // Array(16) of accuracy objects
}
```

**Usage:**
- Passed to AccuracyFeedback component
- Reduces prop drilling from 3 props to 1 DTO
- Provides static factory method: `BeatStateDTO.create(state)`

### AccuracyResultDTO.js
**Purpose:** Structured accuracy result data

**Properties:**
```javascript
{
  status: string,   // 'correct' | 'incorrect' | 'neutral'
  detected: boolean, // Was sound detected?
  level: number     // Audio level (0.0-1.0)
}
```

**Static Methods:**
- `neutral()` - Creates neutral result (default state)
- `createArray(count)` - Creates array of neutral results

**Usage:**
- Used in accuracyResults state array
- Returned by AccuracyService.evaluateAccuracy()
- Provides consistent data structure

## Animation Loop

### Implementation Pattern
```javascript
useEffect(() => {
  if (!isPlaying) return;

  beatServiceRef.current.start();

  const animationCallbacks = {
    onFrame: () => {
      // 1. Get current beat and audio data
      const beat = beatServiceRef.current.getCurrentBeat();
      const waveformData = audioServiceRef.current.getWaveformData();

      // 2. Detect beat transitions using AnimationService
      const transition = animationServiceRef.current.detectBeatTransition(beat);

      // 3. Evaluate accuracy on beat transition
      if (transition.occurred) {
        const level = accuracyServiceRef.current.calculateAudioLevel(waveformData);
        const soundDetected = level > threshold;
        const result = accuracyServiceRef.current.evaluateAccuracy(
          activeBeats[transition.previousBeat],
          soundDetected,
          level
        );

        // Update accuracy results using AppStateService
        setAccuracyResults(prev =>
          appStateServiceRef.current.processAccuracyUpdate(prev, transition.previousBeat, result)
        );
      }

      // 4. Update current beat state
      setCurrentBeat(beat);

      // 5. Render visualization
      if (visualizationServiceRef.current) {
        visualizationServiceRef.current.draw(waveformData, activeBeats, beat);
      }
    }
  };

  // Start animation loop with callbacks
  animationServiceRef.current.start(animationCallbacks);

  // Cleanup: stop services on unmount or stop
  return () => {
    animationServiceRef.current.stop();
    beatServiceRef.current.stop();
  };
}, [isPlaying, activeBeats, threshold]);
```

### Why requestAnimationFrame?
- **Synced to display refresh** (typically 60fps)
- **Automatic pausing** when tab is inactive (saves CPU)
- **Smooth animation** without janky frame drops
- **Better than setInterval** for visual updates

### Performance Characteristics
- **60 FPS** target frame rate
- **Canvas operations** are GPU-accelerated
- **No memory leaks** via proper cleanup in useEffect return
- **Efficient re-renders** via React state batching

## Timing & Synchronization

### Precision Requirements
- Musical timing requires <10ms accuracy
- `setInterval` drifts up to 50ms over 16 beats at 120 BPM
- `performance.now()` provides microsecond precision

### Beat Calculation Math
```
Example: 120 BPM, 5 seconds elapsed
- Beat duration = 60/120 = 0.5 seconds = 500ms
- Total beats = 5000ms / 500ms = 10 beats
- Current beat = 10 % 16 = beat 10 (11th beat, 0-indexed)
```

### Tempo Change Handling
When tempo changes during playback:
1. Calculate current musical position (fractional beats elapsed)
2. Update beat duration to new tempo
3. Adjust start time to preserve phase
```javascript
const beatsElapsed = elapsed / oldBeatDuration;
this.startTime = now - (beatsElapsed * newBeatDuration);
```
This ensures beat position doesn't jump when tempo changes.

## CSS Architecture

### CSS Variables
```css
:root {
  /* Colors */
  --color-correct: #4caf50;
  --color-incorrect: #f44336;
  --color-neutral: #e0e0e0;
  --color-current-beat: #1976d2;
  --color-border: #ccc;
  --color-panel-bg: #fafafa;
  --color-panel-border: #e0e0e0;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Dimensions */
  --input-width: 150px;
  --accuracy-box-height: 50px;
  --panel-border-radius: 4px;
}
```

### Utility Classes
- **Flexbox**: `flex-center-column`, `flex-center-row`, `flex-wrap-center`
- **Spacing**: `gap-xs`, `gap-sm`, `gap-md`, `gap-lg`, `mb-xs`, `mb-sm`, `mb-md`, `mb-lg`
- **Input**: `input-fixed-width` (150px width for text inputs)
- **Panel**: `panel-container` (consistent panel styling with border and background)
- **Accuracy**: `accuracy-feedback-item`, `accuracy-feedback-item.current`

### Design Philosophy
- **CSS Variables** for consistent theming and easy maintenance
- **Utility Classes** for common patterns (reduces inline styles from 21 to 12)
- **Semantic Classes** for component-specific styles (e.g., accuracy-feedback-item)
- **Dynamic Styles** kept inline only when truly necessary (colors based on state, conditional spacing)

## UI/UX Design

### Layout Strategy
- **Header Section**: Tempo + threshold inputs + 16-beat selector (vertically stacked, centered)
- **Control Section**: Start/Stop buttons (horizontally centered)
- **Visualization Section**: Full-width canvas (300px height)
- **Accuracy Section**: 16 colored boxes showing performance feedback
- **Status Section**: Current beat and tempo display (when playing)

### Responsive Breakpoints
```css
Desktop (>1024px):  max-width: 1200px
Tablet (768-1024px): max-width: 900px
Mobile (<768px):     max-width: 100%
```

### Color Scheme
- **Primary**: Blue (#1976d2) - Current beat highlight, buttons
- **Correct**: Green (#4caf50) - Active beat markers, correct hits
- **Incorrect**: Red (#f44336) - Incorrect hits (missed or extra beats)
- **Neutral**: Gray (#e0e0e0) - Neutral state, inactive beats
- **Background**: Purple gradient (body), White (Paper), Light gray (canvas)

### Material UI Theme
- Default Material UI theme
- Roboto font family
- Elevation-based shadows (Paper elevation={3})

## Error Handling

### Microphone Permission Flow
1. User clicks "Start"
2. If not initialized, request microphone access
3. On success: Set `audioInitialized=true`, start playback
4. On failure: Display error in Material UI Alert
   - "Permission denied" → User-friendly message
   - Other errors → Technical error message

### Error Types Handled
- **NotAllowedError**: Microphone permission denied
- **NotFoundError**: No microphone device found
- **NotReadableError**: Microphone in use by another application
- **Generic errors**: Fallback error message

### User Feedback
- Error Alert at top of interface (dismissible)
- Start button disabled while playing
- Stop button disabled while stopped
- Status display shows current beat/tempo during playback

## Browser Compatibility

### Required APIs
- Web Audio API (AudioContext, AnalyserNode)
- getUserMedia (MediaDevices API)
- Canvas 2D Context
- requestAnimationFrame
- performance.now()
- ES6+ JavaScript (classes, arrow functions, async/await)

### Tested Browsers
- Chrome/Edge 89+ ✓
- Firefox 88+ ✓
- Safari 14.1+ ✓ (requires HTTPS or localhost)

### Known Limitations
- **HTTPS required** for microphone access (except localhost)
- **User gesture required** to start AudioContext (autoplay policy)
- **Safari quirks**: May require additional user interaction
- **Mobile browsers**: Limited support for real-time audio processing

## Performance Considerations

### Optimization Techniques
1. **Service instances in useRef** - Avoids recreation on every render
2. **Device pixel ratio scaling** - Sharp rendering on retina displays
3. **Canvas clearing** - Only clear and redraw changed areas (beat sections)
4. **Float32Array** - Efficient typed array for audio data
5. **requestAnimationFrame** - GPU-accelerated, synced to display refresh

### Memory Management
- **Cleanup in useEffect** - Prevents memory leaks
- **AudioContext closure** - Releases audio resources on unmount
- **MediaStream track stopping** - Releases microphone access
- **Animation frame cancellation** - Stops rendering loop when not playing

### Potential Bottlenecks
- **Canvas redraw** at 60fps with complex waveforms (acceptable for 2048 samples)
- **FFT size** (2048) balances resolution vs performance
- **State updates** trigger re-renders (batched by React 18)

## Future Enhancement Possibilities

### Feature Ideas
- Click/tap to create sound on active beats (metronome)
- Record and playback user performance
- Visual feedback for rhythm accuracy
- Multiple pattern presets (4/4, 3/4, 6/8, etc.)
- Adjust microphone sensitivity/gain
- Export patterns as MIDI
- Subdivisions (8th notes, 16th notes)

### Technical Improvements
- Web Workers for audio processing
- WebAssembly for DSP algorithms
- Offline audio context for rendering
- IndexedDB for pattern storage
- Service Worker for offline capability
- TypeScript for type safety
- Build step for production optimization

## Development Notes

### Load Order Importance
Scripts must load in this order:
1. React + ReactDOM
2. Emotion (React + Styled)
3. Material UI
4. Babel (for JSX transformation)
5. Services (AudioService, BeatService, VisualizationService, AccuracyService, AnimationService, AppStateService)
6. DTOs (PlaybackControlDTO, BeatStateDTO, AccuracyResultDTO)
7. Components (TempoInput, ThresholdInput, BeatSelector, ControlHeader, VisualizationPanel, AccuracyFeedback)
8. App.js (uses all of the above)

**Note:** DTOs must load after services (some DTOs may reference service types) and before components (components use DTOs).

### Debugging Tips
- Check console for library load confirmation
- Verify microphone permissions in browser settings
- Use browser audio context state inspector
- Check `performance.now()` values for timing issues
- Canvas rendering: Use fillRect with different colors to debug layout

### Common Issues
1. **Microphone not working**: Check HTTPS requirement
2. **No sound visualization**: Verify AudioContext state is "running"
3. **Timing drift**: Ensure using `performance.now()`, not `Date.now()`
4. **Canvas blurry**: Check device pixel ratio scaling
5. **JSX not transforming**: Verify `type="text/babel"` on script tags

## Project Status

### Completed Features ✓

**Goal 1: React + Material UI Foundation**
- [x] React 18 + Material UI skeleton
- [x] 16-beat selector with visual grouping
- [x] Tempo input (40-240 BPM) with validation
- [x] Responsive layout

**Goal 2: Audio Visualization & Beat Tracking**
- [x] Microphone access and audio capture
- [x] Real-time waveform visualization
- [x] Beat markers (active/inactive states)
- [x] Current beat position tracking
- [x] Canvas rendering with 16-beat loop
- [x] Start/Stop controls
- [x] Error handling and user feedback
- [x] High-precision timing (no drift)
- [x] Live tempo changes during playback

**Goal 3: Accuracy Feedback System**
- [x] Threshold input for audio detection sensitivity
- [x] AccuracyService for audio level calculation
- [x] Real-time accuracy evaluation (correct/incorrect/neutral)
- [x] AccuracyFeedback component with color-coded display
- [x] Beat transition detection for accuracy evaluation
- [x] Visual feedback for each beat (green/red/gray)
- [x] Current beat highlighting in feedback display

**Goal 4: Code Structure Refactoring**
- [x] DTO pattern implementation (PlaybackControlDTO, BeatStateDTO, AccuracyResultDTO)
- [x] AnimationService extraction (beat transition detection, animation loop management)
- [x] AppStateService extraction (state initialization, accuracy updates)
- [x] CSS utility classes (flexbox, spacing, panel, accuracy feedback)
- [x] CSS variables for theming (colors, spacing, dimensions)
- [x] Reduced prop drilling (6→4 props in ControlHeader, 3→1 prop in AccuracyFeedback)
- [x] Migrated inline styles to CSS (21→12 inline sx props, 55→137 CSS lines)
- [x] Cleaner App.js architecture (business logic extracted to services)

### Known Issues
- None at this time

### Next Goals
- Goal 5: TBD (potential features: metronome click, pattern presets, MIDI export, etc.)

## Technical Decisions & Rationale

### Why No Build Step?
- **Simplicity**: No Node.js, npm, or build tool setup required
- **Transparency**: All code is directly viewable and debuggable
- **Learning**: Clear understanding of dependencies and load order
- **Rapid iteration**: Edit and refresh, no compilation step

### Why Canvas over SVG?
- **Performance**: Better for 60fps real-time updates
- **Simpler**: Direct pixel manipulation vs DOM updates
- **Control**: Fine-grained control over rendering

### Why Services Pattern?
- **Testability**: Business logic isolated from React components
- **Reusability**: Services can be used in different contexts
- **Separation**: Clear boundaries between UI and logic
- **Maintainability**: Easier to refactor or replace implementations

### Why performance.now() over Date.now()?
- **Precision**: Sub-millisecond accuracy (microseconds)
- **Monotonic**: Not affected by system clock adjustments
- **Musical timing**: Critical for accurate rhythm tracking

### Why DTOs (Data Transfer Objects)?
- **Type Safety**: Structured data contracts between components
- **Reduced Prop Drilling**: Single DTO object instead of multiple props
- **Maintainability**: Easier to modify data structures in one place
- **Clarity**: Clear data ownership and flow through the application
- **Refactoring Safety**: Changes to data structure only affect DTO, not all components

### Why CSS Utility Classes?
- **Reusability**: Common patterns defined once, used everywhere
- **Consistency**: CSS variables ensure uniform spacing, colors, dimensions
- **Performance**: CSS classes faster than inline styles (no style recalculation)
- **Maintainability**: Global theme changes in one place (CSS variables)
- **Readability**: `className="flex-center-column"` clearer than nested sx objects
- **Balance**: Keep dynamic styles inline (state-based colors), static patterns in CSS

### Why AnimationService?
- **Separation of Concerns**: Animation logic extracted from App.js
- **Testability**: Beat transition detection can be unit tested
- **Reusability**: Animation loop pattern can be reused in other contexts
- **Clarity**: Single responsibility (animation orchestration)
- **Reduced Complexity**: App.js focuses on state management, not animation details

### Why AppStateService?
- **State Management**: Centralized state initialization and updates
- **Immutability Helpers**: Ensures state updates are immutable
- **Consistency**: State structure defined in one place
- **Testability**: State logic can be tested independently
- **Extensibility**: Easy to add new state management methods

---

**Last Updated**: 2026-02-21
**Project Version**: Goal 4 Complete (Refactored Architecture)
**React Version**: 18.2.0
**Material UI Version**: 5.x
