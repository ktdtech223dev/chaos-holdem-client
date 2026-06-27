#!/usr/bin/env node
/*
 * Chaos Hold'Em build tool — modular sources -> single shippable chaos_holdem.html.
 *
 *   node build.js --extract   (one-time) split chaos_holdem.html into src/ + shell
 *   node build.js             rebuild chaos_holdem.html from src/  (run after editing src/)
 *
 * The game ships as ONE self-contained HTML file (electron-builder packages chaos_holdem.html).
 * Edit the modular sources in src/ for sanity, then `npm run build` to inline them back.
 * Source of truth = src/. The build is deterministic: re-inlining the unchanged sources
 * reproduces the exact same chaos_holdem.html.
 */
const fs = require('fs');
const path = require('path');
const DIR = __dirname;
const HTML = path.join(DIR, 'chaos_holdem.html');
const SRC = path.join(DIR, 'src');
const SHELL = path.join(SRC, 'index.shell.html');
const STYLES = path.join(SRC, 'styles.css');
const EIGHTBIT = path.join(SRC, 'eightbit-theme.css');
const GAME = path.join(SRC, 'game.js');

const MARK_STYLES = '<!--{{STYLES}}-->';
const MARK_EIGHTBIT = '<!--{{EIGHTBIT}}-->';
const MARK_GAME = '<!--{{GAME}}-->';

function splitOnce(s, open, close, from) {
  const a = s.indexOf(open, from || 0);
  if (a < 0) return null;
  const contentStart = a + open.length;
  const b = s.indexOf(close, contentStart);
  if (b < 0) return null;
  return { openEnd: contentStart, closeStart: b, content: s.slice(contentStart, b) };
}

function extract() {
  const html = fs.readFileSync(HTML, 'utf8');
  // main <style> ... </style>
  const st = splitOnce(html, '<style>', '</style>');
  // <style id="eightbit-theme" media="not all"> ... </style>
  // NOTE: use the full tag (with media="not all") so we don't match a comment in the
  // main stylesheet that merely mentions <style id="eightbit-theme">.
  const EB_TAG = '<style id="eightbit-theme" media="not all">';
  const ebOpenIdx = html.indexOf(EB_TAG);
  const ebTagEnd = ebOpenIdx + EB_TAG.length;
  const ebCloseStart = html.indexOf('</style>', ebTagEnd);
  // main game <script> ... </script>  (the big one — last </script>)
  const scOpen = html.indexOf('<script>');
  const scTagEnd = scOpen + '<script>'.length;
  const scClose = html.lastIndexOf('</script>');

  if (!st || ebOpenIdx < 0 || scOpen < 0 || scClose < 0) throw new Error('could not locate all segments');

  const styles = st.content;
  const eightbit = html.slice(ebTagEnd, ebCloseStart);
  const game = html.slice(scTagEnd, scClose);

  // Build a shell with placeholders, preserving everything else verbatim.
  let shell = html.slice(0, st.openEnd) + MARK_STYLES + html.slice(st.closeStart, ebTagEnd) + MARK_EIGHTBIT + html.slice(ebCloseStart, scTagEnd) + MARK_GAME + html.slice(scClose);

  fs.mkdirSync(SRC, { recursive: true });
  fs.writeFileSync(STYLES, styles);
  fs.writeFileSync(EIGHTBIT, eightbit);
  fs.writeFileSync(GAME, game);
  fs.writeFileSync(SHELL, shell);
  console.log('Extracted -> src/styles.css (' + styles.length + '), src/eightbit-theme.css (' + eightbit.length + '), src/game.js (' + game.length + '), src/index.shell.html');
}

function build() {
  const shell = fs.readFileSync(SHELL, 'utf8');
  const out = shell
    .replace(MARK_STYLES, () => fs.readFileSync(STYLES, 'utf8'))
    .replace(MARK_EIGHTBIT, () => fs.readFileSync(EIGHTBIT, 'utf8'))
    .replace(MARK_GAME, () => fs.readFileSync(GAME, 'utf8'));
  fs.writeFileSync(HTML, out);
  console.log('Built chaos_holdem.html (' + out.length + ' bytes) from src/');
}

if (process.argv.includes('--extract')) extract();
else build();
