# Project overview

This project is a web-based tool that should allow to train rythm by allowing to define a pattern to respect and listen to microphone input
to detect timing precision.
It is primary to be used by guitar but could work with percussion as well.

# General instructions

You'll be instructed to achieve goals in an iterative manner, one goal at a time.
For each goal a plan should be prepared, asking clarification when necessary, and waiting for user accept before proceding.

# Goals

## Goal 1 (DONE): Bootstrap a first running skeleton

Setup a minimal react project with a basic usage of an input text box with a minimal responsive layout

## Goal 2 (Done): Create basic functionality

Implement a basic functionality allowing to activate or deactivate 16 beat position, divided in 4 measure or 4 beat.
An input box should allow to enter the desired tempo.
Bellow display a diagram plotting microphone input as a line, with a representation of the current active portion of the 16 beat position.
The line should be plot horizontal with a match to the defined tempo, and it should be erased and start again from the left after the 4 measures.

- General code structure
  - Separate well business logic in separate service class
  - Limit the business logic in App.JS to the minimum
  - create well encapsulated component
- UI structure
  - All inputs in an header section at the top
    - General tempo input at the top, with a label.
    - 16-beat selection widget on a single line below the tempo
  - A large graphical representation below plotting microphone input and beat progress

## Goal 3 (Done): Analyze microphone input and evaluate basic accuracy of the rythme

Using a threshold, the microphone input should be classified as 'beating' or 'non-beating'.
If the current beat according to the time is expected to be played, and the input is 'beating', then turn green a
precision feedback component down the chart.
If however it is not matching the expected state, turn it red.

- UI structure
  - Feedback component at the bottom of the chart, same width
  - In the header add an input box to adjust the detection threshold

## Goal 4 (Done): Improve code structure

The code is functional but the software architecture is not respecting proper isolation of functionliaties

- To much business logic is present in the App.js. It should be kept miniam and all logic being distributed between components and services
- Proper DTO should be put in place when applicable to communicate state between components and services
- CSS file is underused and lot of styles are incorrectly expressed in the JS code

## Goal 5 (Done): Multi-Layer Sound Detection + Metronome Tick

The app moves from a single flat beat pattern to a multi-layer drum-machine model: each layer represents a distinct sound type (e.g. bass string, snare).
Users can add or remove layers, name them freely, and set independent beat patterns per layer.

Calibration: Before a layer can give accuracy feedback, the user must calibrate it by recording a few seconds of the target sound. The app captures a
frequency fingerprint (FFT profile) and stores it on the layer. Layers without a profile show no feedback — they are neutral until calibrated.

Detection: On each beat transition, the app classifies the detected sound by comparing its frequency content to all calibrated layer profiles using cosine
similarity. A sound is attributed to the closest matching layer above a similarity threshold. Accuracy (correct/incorrect) is then evaluated per layer
independently.

Metronome: A short click sound fires at the start of each bar (every 4 beats). It is on by default and can be toggled.

Key decisions:

- Uncalibrated layers show "Calibrate to see feedback" rather than being hidden, so the user is always aware of all layers
- The tick fires at beats 0, 4, 8, 12 specifically (bar-start, not every beat)
- The similarity threshold is 0.65 — sounds that don't match any layer above this are treated as unclassified
- The visualization canvas reflects the merged active beats across all layers (OR of all patterns)

## Goal 6 (Done): Re-structure the UI

The UI should be split into 3 tabs with a clear purpose

- The first one should allow to define one or several instrument and calibrate them. Level and match threshold should be defined on that panel
- The second one would allow to define the beat pattern expected for each instrument.
- The third one will allow to launch the exercise. Tempo and tick option as well as visulaization panel will be here.

You'll adapt the code organization with respect to those 3 distinct part, plus the main part aside.

## Goal 7 (Done): Improve instrument calibration

Instrument calibration and accuray evaluation have to be improved.
Calibration panel should offer a visualisation of frequency diagram as a little vertical barchart, aside each instrument.
Result of calibration should be displayed in that chart to help understand how different recorded instrument are.

The use of Meyda.js library will be required for a better accuracy. MFCC, Chronogram and RMS should be used.
All frequency below 120Hz should be filtered out to limit noise.

Add a manual mode as well to detect rythm from an associated key to each instrument, that can be selected in the calibration screen. This will help as a fallback for noisy environments

## Goal 8: Add a visula feedback on the calibration screen about quality of calibration

Add a test button on the calibration screen taht will work like the recording but to test if calibration was right.
It should display in realtime a chart of frequencies identical to the mini-barchart of instrument frequencies.
During the test, the same procedure that will be applied during the training session should be applied to recognized matching instrument. When an instrument is matched a little green indicator, its frequency chart should turn green during the matching time.

# Technical stack

The project should be implemented as a single page application, running exclusively on the browser without backend.

- Javascript and ReactJS framework should be used
- JSX with Babel should be used for the rendering part
- Number of libraries should be limited
  - Have the minified version of required libraries available locally to avoid CORS issues
- Materiel UI would be the prefered library for UI components

# Coding instructions

- Code should respect best practices of React development, with proper decomposition in components
- Have a clear separation between the html, css and js resources
