# Subway Lights

## Overview

**This project is a work-in-progress.** Subway Lights is a project designed to provide real-time tracking and visualization of NYC subways' positions along their routes. It currently illustrates the L train's position and only illustrates trains in between or at stops not exact positions.

## Features

-   Real-time tracking of L train positions
-   Visualization of the train's route on a map

## Project Structure

-   `src/index.js`: Main projectfile that fetches data from the MTA's APIs and feeds it into the `trainPosition.js` file, then updates the SVG visualization.
-   `src/trainPosition.js`: Contains the main logic for finding and normalizing the train's position to the SVG container based on its current status and stop sequence.
-   `src/data`: Temporary storage of cleaned data from the MTA's APIs and other sources, such as .txt files of constant data.

## Usage

1. Clone the repository:
    ```
    git clone https://github.com/quinnHalsey/subway-lights.git
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Run the project:
    ```
    npm start
    ```
4. Open the project in your browser at `http://localhost:5173`
