import React from "react";

export type AutoplayMode = "word" | "both" | "sentence";

type Props = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  autoplay: boolean;
  onAutoplayToggle: () => void;
  mode: AutoplayMode;
  onModeChange: (mode: AutoplayMode) => void;
  gapSeconds: number;
  onGapChange: (val: number) => void;
  progressLabel: string;
  currentLabel?: string;
};

const modes: { label: string; value: AutoplayMode }[] = [
  { label: "Word", value: "word" },
  { label: "Word + Sentence", value: "both" },
  { label: "Sentence", value: "sentence" },
];

export function BottomPlayer({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  autoplay,
  onAutoplayToggle,
  mode,
  onModeChange,
  gapSeconds,
  onGapChange,
  progressLabel,
  currentLabel,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-2xl">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            className={`px-4 py-2 rounded-full font-semibold text-white ${
              isPlaying ? "bg-rose-500" : "bg-emerald-600"
            }`}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous card"
              className="px-3 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-slate-300"
            >
              ⏮ Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next card"
              className="px-3 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-slate-300"
            >
              ⏭ Next
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-label={`Set autoplay mode to ${m.label}`}
              onClick={() => onModeChange(m.value)}
              className={`px-3 py-2 rounded-full text-sm font-semibold border transition ${
                mode === m.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-slate-300"
              checked={autoplay}
              onChange={onAutoplayToggle}
              aria-label="Toggle autoplay"
            />
            Autoplay
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Gap</span>
            <input
              type="range"
              min={1}
              max={8}
              value={gapSeconds}
              onChange={(e) => onGapChange(Number(e.target.value))}
              aria-label="Autoplay gap seconds"
            />
            <span className="text-sm font-semibold text-slate-700">
              {gapSeconds}s
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-600">
            {progressLabel}
            {currentLabel ? ` · ${currentLabel}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomPlayer;
