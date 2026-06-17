import { useEffect, useMemo, useRef, useState } from "react";
import BottomPlayer, { AutoplayMode } from "./components/BottomPlayer";
import WordCard from "./components/WordCard";
import { words, Word } from "./data/mockWords";
import { Clip, useAudioPlayer } from "./hooks/useAudioPlayer";
import { usePersistentState } from "./hooks/usePersistentState";

type Settings = {
  autoplay: boolean;
  gapSeconds: number;
  mode: AutoplayMode;
};

const DEFAULT_SETTINGS: Settings = {
  autoplay: true,
  gapSeconds: 2,
  mode: "both",
};

const clampIndex = (value: number, length: number) =>
  Math.max(0, Math.min(length - 1, value));

function App() {
  const [selectedIndex, setSelectedIndex] = usePersistentState<number>(
    "fluent360-selected-index",
    0
  );
  const [settings, setSettings] = usePersistentState<Settings>(
    "fluent360-settings",
    DEFAULT_SETTINGS
  );

  const safeIndex = clampIndex(selectedIndex, words.length);
  const selectedWord = words[safeIndex] ?? words[0];
  // Transient UI state — must NOT persist, or a one-off failure keeps showing
  // the error banner on every reload even after audio works again.
  const [audioError, setAudioError] = useState<string | null>(null);

  const {
    playClip,
    pause,
    isPlaying,
    currentClip,
    preload,
  } = useAudioPlayer({
    onEnded: handleClipEnded,
    onError: (clip, err) => {
      setAudioError(
        clip
          ? `Audio failed: ${clip.wordId} (${clip.kind})`
          : "Audio failed to load"
      );
      console.warn("Audio error", clip, err);
    },
    onBlocked: (clip) => {
      setAudioError(
        clip
          ? "Sound blocked by browser. Tap a play button to enable audio."
          : "Sound blocked by browser. Tap any play button to enable audio."
      );
    },
  });

  const gapTimeout = useRef<number | null>(null);

  function clearGapTimeout() {
    if (gapTimeout.current !== null) {
      window.clearTimeout(gapTimeout.current);
      gapTimeout.current = null;
    }
  }

  function setSelected(idx: number) {
    clearGapTimeout();
    setSelectedIndex(clampIndex(idx, words.length));
  }

  function handleClipEnded(clip: Clip) {
    if (!(settings.autoplay && clip.fromAutoplay)) {
      return;
    }

    clearGapTimeout();
    const currentIdx = words.findIndex((w) => w.id === clip.wordId);
    const gapMs = Math.max(0, settings.gapSeconds) * 1000;

    if (settings.mode === "both" && clip.kind === "pronunciation") {
      gapTimeout.current = window.setTimeout(() => {
        playSentenceAt(currentIdx, true);
      }, gapMs);
      return;
    }

    const nextIndex = (currentIdx + 1) % words.length;
    setSelected(nextIndex);
    gapTimeout.current = window.setTimeout(() => {
      playFirstForMode(nextIndex, true);
    }, gapMs);
  }

  function playPronunciationAt(index: number, fromAutoplay: boolean) {
    const word = words[index];
    if (!word) return;
    clearGapTimeout();
    setSelectedIndex(index);
    playClip({
      src: word.audioPronunciationUrl,
      wordId: word.id,
      kind: "pronunciation",
      fromAutoplay,
    });
    preloadNext(index);
  }

  function playSentenceAt(index: number, fromAutoplay: boolean) {
    const word = words[index];
    if (!word) return;
    clearGapTimeout();
    setSelectedIndex(index);
    playClip({
      src: word.audioSentenceUrl,
      wordId: word.id,
      kind: "sentence",
      fromAutoplay,
    });
    preloadNext(index);
  }

  function playFirstForMode(index: number, fromAutoplay: boolean) {
    if (settings.mode === "sentence") {
      playSentenceAt(index, fromAutoplay);
    } else {
      playPronunciationAt(index, fromAutoplay);
    }
  }

  function preloadNext(currentIdx: number) {
    const nextIdx = (currentIdx + 1) % words.length;
    const nextWord = words[nextIdx];
    if (!nextWord) return;
    if (settings.mode === "sentence") {
      preload(nextWord.audioSentenceUrl);
    } else {
      preload(nextWord.audioPronunciationUrl);
    }
  }

  function handleTogglePlay() {
    if (isPlaying) {
      pause();
      clearGapTimeout();
      return;
    }
    playFirstForMode(safeIndex, true);
  }

  function handleAutoplayToggle() {
    const nextAutoplay = !settings.autoplay;
    if (!nextAutoplay) {
      clearGapTimeout();
    }
    setSettings({ ...settings, autoplay: nextAutoplay });
  }

  function handleModeChange(mode: AutoplayMode) {
    clearGapTimeout();
    setSettings({ ...settings, mode });
    if (isPlaying) {
      playFirstForMode(safeIndex, true);
    }
  }

  function handleGapChange(val: number) {
    setSettings({ ...settings, gapSeconds: val });
  }

  function handlePrev() {
    const prev = safeIndex === 0 ? words.length - 1 : safeIndex - 1;
    setSelected(prev);
    if (settings.autoplay || isPlaying) {
      playFirstForMode(prev, settings.autoplay);
    }
  }

  function handleNext() {
    const next = (safeIndex + 1) % words.length;
    setSelected(next);
    if (settings.autoplay || isPlaying) {
      playFirstForMode(next, settings.autoplay);
    }
  }

  function handleCardSelect(idx: number) {
    setSelected(idx);
    if (settings.autoplay && isPlaying) {
      playFirstForMode(idx, true);
    }
  }

  useEffect(() => {
    return () => clearGapTimeout();
  }, []);

  const progressLabel = useMemo(
    () => `${safeIndex + 1} / ${words.length}`,
    [safeIndex, words.length]
  );

  return (
    <div className="pb-28">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-6 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.3em] text-emerald-200">
              Fluent360
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Vocab Word Cards
            </h1>
            <p className="text-sm text-slate-200">
              Tap a card to select it. Use autoplay to keep practicing offline.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-emerald-500 text-white font-semibold">
              PWA Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
        {audioError && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm font-semibold">
            {audioError} — if it persists, hard-refresh with cache disabled or clear the service worker.
            <button
              type="button"
              className="ml-3 text-amber-900 underline"
              onClick={() => setAudioError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="grid gap-4">
          {words.map((word, idx) => (
            <WordCard
              key={word.id}
              word={word as Word}
              index={idx}
              isSelected={idx === safeIndex}
              isPronunciationActive={
                currentClip?.wordId === word.id &&
                currentClip.kind === "pronunciation" &&
                isPlaying
              }
              isSentenceActive={
                currentClip?.wordId === word.id &&
                currentClip.kind === "sentence" &&
                isPlaying
              }
              onSelect={() => handleCardSelect(idx)}
              onPlayPronunciation={() => playPronunciationAt(idx, settings.autoplay)}
              onPlaySentence={() => playSentenceAt(idx, settings.autoplay)}
            />
          ))}
        </div>
      </main>

      <BottomPlayer
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        autoplay={settings.autoplay}
        onAutoplayToggle={handleAutoplayToggle}
        mode={settings.mode}
        onModeChange={handleModeChange}
        gapSeconds={settings.gapSeconds}
        onGapChange={handleGapChange}
        progressLabel={progressLabel}
        currentLabel={selectedWord?.word}
      />
    </div>
  );
}

export default App;
