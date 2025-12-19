type AudioPaths = {
  pronunciation: string;
  example: string;
};

type Card = {
  id: string;
  word: string;
  partOfSpeech: string;
  phonetic: string;
  cefrLevel: string;
  rank: number;
  definition: string;
  example: string;
  image: string;
  imageAlt?: string;
  audio: AudioPaths;
  tags?: string[];
};

type TrackMeta = {
  cardId: string;
  kind: "example" | "pronunciation";
  fromAutoplay: boolean;
};

const { useState, useEffect, useRef, useCallback } = React;
const PLAYBACK_RATES = [0.8, 1.0, 1.2] as const;

function highlightOnce(text: string, target: string): React.ReactNode[] {
  if (!text || !target) return [text];
  const lower = text.toLowerCase();
  const match = target.toLowerCase();
  const idx = lower.indexOf(match);
  if (idx === -1) return [text];
  const before = text.slice(0, idx);
  const mid = text.slice(idx, idx + target.length);
  const after = text.slice(idx + target.length);
  return [
    before,
    React.createElement("span", { className: "highlight", key: "hi" }, mid),
    after,
  ];
}

type AudioButtonProps = {
  label: string;
  onClick: () => void;
  active?: boolean;
};

function AudioButton({ label, onClick, active }: AudioButtonProps) {
  return (
    <button
      className={`btn small ${active ? "active" : ""}`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type CardProps = {
  card: Card;
  index: number;
  onPlayPronunciation: (card: Card) => void;
  onPlayExample: (card: Card, fromAutoplay: boolean) => void;
  isPronunciationActive: boolean;
  isExampleActive: boolean;
};

function CardView({
  card,
  index,
  onPlayPronunciation,
  onPlayExample,
  isPronunciationActive,
  isExampleActive,
}: CardProps) {
  return (
    <div className="card">
      <img
        src={`/mock-data/${card.image}`}
        alt={card.imageAlt || card.word}
        loading="lazy"
      />
      <div>
        <div className="word-row">
          <span className="word-rank">{index + 1}.</span>
          <span className="word">{card.word}</span>
          <AudioButton
            label={isPronunciationActive ? "⏸ Pronunciation" : "🔊 Pronunciation"}
            onClick={() => onPlayPronunciation(card)}
            active={isPronunciationActive}
          />
          <AudioButton
            label={isExampleActive ? "⏸ Example" : "▶ Example"}
            onClick={() => onPlayExample(card, false)}
            active={isExampleActive}
          />
        </div>
        <div className="phonetic">{card.phonetic || "[—]"}</div>
        <div className="actions">
          <span className="chip">
            {card.partOfSpeech} · CEFR {card.cefrLevel}
          </span>
        </div>
        <div className="definition">
          <span className="highlight">{card.partOfSpeech}. </span>
          {card.definition}
        </div>
        <div className="example">{highlightOnce(card.example, card.word)}</div>
        <div className="tags">
          {(card.tags || []).map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

type BottomBarProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  autoplayEnabled: boolean;
  setAutoplayEnabled: (val: boolean) => void;
  loopAll: boolean;
  setLoopAll: (val: boolean) => void;
  playbackRate: number;
  setPlaybackRate: (val: number) => void;
  currentIndex: number;
  total: number;
  currentWord: string;
};

function BottomBar({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  autoplayEnabled,
  setAutoplayEnabled,
  loopAll,
  setLoopAll,
  playbackRate,
  setPlaybackRate,
  currentIndex,
  total,
  currentWord,
}: BottomBarProps) {
  return (
    <div className="bottom-bar">
      <span className="label">Auto Player</span>
      <button className="btn primary" type="button" onClick={onTogglePlay}>
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>
      <button className="btn" type="button" onClick={onPrev}>
        ⏮ Prev
      </button>
      <button className="btn" type="button" onClick={onNext}>
        ⏭ Next
      </button>
      <div className="divider" />
      <button
        className={`btn ${autoplayEnabled ? "secondary" : ""}`}
        type="button"
        onClick={() => setAutoplayEnabled(!autoplayEnabled)}
      >
        {autoplayEnabled ? "✅ Autoplay" : "Autoplay Off"}
      </button>
      <button
        className={`btn ${loopAll ? "secondary" : ""}`}
        type="button"
        onClick={() => setLoopAll(!loopAll)}
      >
        {loopAll ? "🔁 Loop" : "Loop Off"}
      </button>
      <div className="divider" />
      <div className="speed-group">
        {PLAYBACK_RATES.map((rate) => (
          <button
            key={rate}
            className={`speed-btn ${playbackRate === rate ? "active" : ""}`}
            onClick={() => setPlaybackRate(rate)}
            type="button"
          >
            {rate.toFixed(1)}x
          </button>
        ))}
      </div>
      <div className="counter">
        {total ? `${currentIndex + 1}/${total} · ${currentWord || "—"}` : "—"}
      </div>
    </div>
  );
}

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<TrackMeta | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState<boolean>(true);
  const [loopAll, setLoopAll] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<TrackMeta | null>(null);
  const cardsRef = useRef<Card[]>([]);
  const currentIndexRef = useRef<number>(0);
  const autoplayRef = useRef<boolean>(true);
  const loopRef = useRef<boolean>(true);
  const playbackRateRef = useRef<number>(1.0);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    autoplayRef.current = autoplayEnabled;
  }, [autoplayEnabled]);

  useEffect(() => {
    loopRef.current = loopAll;
  }, [loopAll]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    async function loadCards() {
      try {
        const res = await fetch("/mock-data/cards.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Card[] = await res.json();
        setCards(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Unable to load cards. Check your dev server.");
        setLoading(false);
      }
    }
    loadCards();
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch((err) => {
        console.warn("SW registration failed", err);
      });
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (trackRef.current?.fromAutoplay && autoplayRef.current) {
      handleNextAutoplay();
    } else {
      setIsPlaying(false);
    }
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [handleEnded, handlePause, handlePlay]);

  const playSource = useCallback((src: string, trackMeta: TrackMeta) => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.pause();
    audio.src = src;
    audio.playbackRate = playbackRateRef.current;
    audio.currentTime = 0;
    trackRef.current = trackMeta;
    setCurrentTrack(trackMeta);
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn("Playback blocked until user interaction", err);
      });
  }, []);

  const playExample = useCallback(
    (card: Card, fromAutoplay: boolean) => {
      if (!card) return;
      const index = cardsRef.current.findIndex((c) => c.id === card.id);
      if (index >= 0) {
        setCurrentIndex(index);
        currentIndexRef.current = index;
      }
      playSource(`/mock-data/${card.audio.example}`, {
        cardId: card.id,
        kind: "example",
        fromAutoplay,
      });
    },
    [playSource]
  );

  const playPronunciation = useCallback(
    (card: Card) => {
      if (!card) return;
      playSource(`/mock-data/${card.audio.pronunciation}`, {
        cardId: card.id,
        kind: "pronunciation",
        fromAutoplay: false,
      });
    },
    [playSource]
  );

  const playIndex = useCallback(
    (index: number, fromAutoplay: boolean) => {
      const items = cardsRef.current;
      if (!items.length) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      const card = items[clamped];
      setCurrentIndex(clamped);
      currentIndexRef.current = clamped;
      playExample(card, fromAutoplay);
    },
    [playExample]
  );

  const handleNextAutoplay = useCallback(() => {
    const items = cardsRef.current;
    if (!items.length) return;
    let next = (currentIndexRef.current || 0) + 1;
    if (next >= items.length) {
      if (!loopRef.current) {
        setIsPlaying(false);
        return;
      }
      next = 0;
    }
    playIndex(next, true);
  }, [playIndex]);

  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      return;
    }
    playIndex(currentIndexRef.current || 0, true);
  }, [isPlaying, playIndex]);

  const handlePrev = useCallback(() => {
    const items = cardsRef.current;
    if (!items.length) return;
    let prev = (currentIndexRef.current || 0) - 1;
    if (prev < 0) prev = loopRef.current ? items.length - 1 : 0;
    playIndex(prev, true);
  }, [playIndex]);

  const handleNext = useCallback(() => {
    const items = cardsRef.current;
    if (!items.length) return;
    let next = (currentIndexRef.current || 0) + 1;
    if (next >= items.length) next = loopRef.current ? 0 : items.length - 1;
    playIndex(next, true);
  }, [playIndex]);

  const activeWord = cards[currentIndex]?.word || "";

  return (
    <div className="app">
      <div className="header">
        <h1>Fluent360 — PWA Deck</h1>
        <div className="status">
          {isOffline ? <span className="offline-badge">Offline</span> : "Online"}
        </div>
      </div>

      {loading && <div className="loading">Loading vocabulary cards…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {cards.map((card, idx) => (
            <CardView
              key={card.id}
              card={card}
              index={idx}
              onPlayPronunciation={playPronunciation}
              onPlayExample={playExample}
              isPronunciationActive={
                isPlaying &&
                currentTrack?.cardId === card.id &&
                currentTrack?.kind === "pronunciation"
              }
              isExampleActive={
                isPlaying &&
                currentTrack?.cardId === card.id &&
                currentTrack?.kind === "example"
              }
            />
          ))}
        </div>
      )}

      <BottomBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrev}
        onNext={handleNext}
        autoplayEnabled={autoplayEnabled}
        setAutoplayEnabled={setAutoplayEnabled}
        loopAll={loopAll}
        setLoopAll={setLoopAll}
        playbackRate={playbackRate}
        setPlaybackRate={setPlaybackRate}
        currentIndex={currentIndex}
        total={cards.length}
        currentWord={activeWord}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
