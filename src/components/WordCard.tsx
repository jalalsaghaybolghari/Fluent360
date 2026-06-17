import { Word } from "../data/mockWords";

type Props = {
  word: Word;
  index: number;
  isSelected: boolean;
  isPronunciationActive: boolean;
  isSentenceActive: boolean;
  onSelect: () => void;
  onPlayPronunciation: () => void;
  onPlaySentence: () => void;
};

export function WordCard({
  word,
  index,
  isSelected,
  isPronunciationActive,
  isSentenceActive,
  onSelect,
  onPlayPronunciation,
  onPlaySentence,
}: Props) {
  return (
    <article
      className={`rounded-2xl bg-white card-shadow border ${
        isSelected ? "border-emerald-400" : "border-slate-100"
      } overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5`}
      onClick={onSelect}
      aria-selected={isSelected}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
        <img
          src={word.imageUrl}
          alt={word.imageAlt}
          className="h-48 w-full object-cover sm:h-full"
          loading="lazy"
        />
        <div className="p-4 sm:p-6 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">
              {index + 1}.
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">{word.word}</h2>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayPronunciation();
              }}
              aria-label={`Play pronunciation for ${word.word}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                isPronunciationActive
                  ? "bg-emerald-500 text-white border-emerald-500"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              🔊 Pronounce
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlaySentence();
              }}
              aria-label={`Play example sentence for ${word.word}`}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                isSentenceActive
                  ? "bg-blue-500 text-white border-blue-500"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              ▶ Sentence
            </button>
          </div>
          <div className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span className="px-3 py-1 rounded-full bg-slate-100 font-semibold">
              {word.phonetic}
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs uppercase">
              {word.definition.split(" ")[0]}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            <span className="font-semibold text-emerald-600">Definition:</span>{" "}
            {word.definition}
          </p>
          <p className="text-slate-800 leading-relaxed">
            <span className="font-semibold text-sky-600">Example:</span>{" "}
            {word.exampleSentence}
          </p>
        </div>
      </div>
    </article>
  );
}

export default WordCard;
