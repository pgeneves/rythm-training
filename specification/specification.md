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

## Goal 4: Improve code structure

The code is functional but the software architecture is not respecting proper isolation of functionliaties

- To much business logic is present in the App.js. It should be kept miniam and all logic being distributed between components and services
- Proper DTO should be put in place when applicable to communicate state between components and services
- CSS file is underused and lot of styles are incorrectly expressed in the JS code

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
