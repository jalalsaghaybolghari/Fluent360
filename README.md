# Fluent360

Mock vocabulary bundle for PWA prototyping (word card + image + pronunciation + example sentence + auto-play).

- Data: `mock-data/cards.json` (relative paths for `images/*.svg` and `audio/*.wav`).
- Media: generated locally via macOS `say` + `afconvert` so everything works offline.
- Regenerate or tweak: edit `mock-data/generate_mock_media.py` and run `python3 mock-data/generate_mock_media.py`.
- All assets are safe placeholders you can ship with a prototype and replace later with production content.

## PWA prototype (React + TypeScript, no build step)

Files:
- `index.html`, `styles.css`, `app.tsx` — UI + autoplay bar using React from CDN and Babel-in-browser TypeScript transform.
- `service-worker.js`, `manifest.webmanifest`, `icons/` — offline cache and install prompts.
- `mock-data/` — bundled images, audio, and JSON deck.

Run locally:
```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

What to test:
- Cards render with images, phonetics, CEFR chip, and highlighted examples.
- Play buttons for pronunciation/example audio.
- Bottom autoplay bar (play/pause, prev/next, autoplay toggle, loop toggle, speed 0.8/1/1.2, counter).
- Service worker caches shell + mock media; toggle devtools to offline and verify playback still works after first load (first load requires network for CDN React/Babel scripts).
