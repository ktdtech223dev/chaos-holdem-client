# Chaos Hold'Em — Electron Setup

## First time setup (do once)

1. Install Node.js from https://nodejs.org (LTS version)
2. Open a terminal in this folder
3. Run: `npm install`

## Run the game (development)

```
npm start
```

## Build a distributable .exe (Windows)

```
npm run build:win
```

The installer will appear in the `dist/` folder.
Share `dist/Chaos Hold'Em Setup 0.5.0.exe` with your friends.
They double-click it, it installs, and it puts a shortcut on their desktop.

## Build for Mac

```
npm run build:mac
```

## Build for both

```
npm run build:all
```

## File structure

```
chaos-holdem-electron/
  main.js               ← Electron window config (don't touch)
  package.json          ← App config and build settings
  chaos_holdem.html     ← THE GAME (put updated versions here)
  assets/
    icon.ico            ← Windows icon (optional, replace with your own)
    icon.icns           ← Mac icon (optional, replace with your own)
  dist/                 ← Built executables appear here after npm run build
```

## Updating the game

1. Replace `chaos_holdem.html` with the new version
2. Bump the version in `package.json`
3. Run `npm run build:win` to build a new installer
4. Share the new .exe — friends reinstall over the old one

## Radio stations

The game includes 4 live radio stations (SomaFM) + 3 built-in synth tracks.
Radio requires an internet connection. Synth tracks always work offline.
Use the ⏮ ⏭ buttons in the audio bar to switch between them.
