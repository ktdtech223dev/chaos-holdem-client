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

## Development (modular sources)

The game ships as ONE self-contained file (`chaos_holdem.html`), but is now authored in modular sources
under `src/`:

```
src/
  index.shell.html   ← HTML shell with {{STYLES}} / {{EIGHTBIT}} / {{GAME}} placeholders
  styles.css         ← main stylesheet
  eightbit-theme.css ← the toggle-able 8-bit retro theme
  game.js            ← all game logic/UI
build.js             ← inlines src/ back into chaos_holdem.html
```

Workflow: **edit the files in `src/`**, then run `npm run build` to regenerate `chaos_holdem.html`.
(`build.js --extract` re-splits the HTML back into `src/` if you ever edit the HTML directly.)
The server (`../server.js`) has its own test suite — run `npm test` from the repo root.

## Updating the game

1. Edit `src/` and run `npm run build` (or edit `chaos_holdem.html` then `node build.js --extract`)
2. Bump the version in `package.json`
3. Run `npm run build:win` (runs the inline build first, then packages the installer)
4. Share the new .exe — friends reinstall over the old one

## Radio stations

The game includes 4 live radio stations (SomaFM) + 3 built-in synth tracks.
Radio requires an internet connection. Synth tracks always work offline.
Use the ⏮ ⏭ buttons in the audio bar to switch between them.
