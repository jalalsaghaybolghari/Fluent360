# Fluent360 Vocab PWA

React + TypeScript + Vite PWA for practicing vocabulary cards with offline audio, autoplay player, and Tailwind styling.

## Quick start
```bash
npm install
npm run prepare:assets   # optional: regenerates audio (uses espeak/espeak-ng if available, falls back to beeps)
npm run dev              # open http://localhost:5173
```

Build + preview:
```bash
npm run build
npm run preview
```

## What’s included
- 24 mock words with phonetics, definitions, example sentences, local SVG illustrations, and audio slots.
- Mobile-first UI: scrollable word cards + bottom “Autoplay Player” (play/pause, next/prev, mode: word / word+sentence / sentence, autoplay toggle, gap slider, progress).
- Offline-ready: vite-plugin-pwa caches the shell, images, and audio after first load.
- Persistence: autoplay mode, gap interval, and last selected card saved in `localStorage`.
- Safe fallbacks: pre-generated beep WAVs in `public/audio/` so playback works even without TTS tools.

## Audio generation
- Script: `npm run generate:audio` (alias `npm run prepare:assets`)
- Tooling: tries `espeak-ng` then `espeak`. If neither is installed, generates beep placeholders.
- Output: `public/audio/pronunciation_<id>.wav` and `public/audio/sentence_<id>.wav`
- To install espeak (macOS): `brew install espeak` (or `espeak-ng`)

## PWA notes
- Manifest + icons emitted by `vite-plugin-pwa`.
- Test offline: run `npm run build && npm run preview`, open devtools → Application → Service Workers → check “Offline” and verify audio/images still play.

## Key files
- `src/App.tsx` — page layout, autoplay logic, persistence.
- `src/components/WordCard.tsx`, `src/components/BottomPlayer.tsx` — UI components.
- `src/hooks/useAudioPlayer.ts`, `src/hooks/usePersistentState.ts` — audio control + localStorage helper.
- `src/data/wordMeta.ts` — text data; `src/data/mockWords.ts` — data hydrated with images + audio paths.
- `src/assets/images/` — local SVG illustrations.
- `public/audio/` — generated audio (beep placeholders committed).
- `scripts/generate-audio.ts` — espeak/beep generator.
- `vite.config.ts` — Vite + PWA config; `tailwind.config.cjs` — Tailwind setup.
