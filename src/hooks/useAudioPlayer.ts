import { useCallback, useEffect, useRef, useState } from "react";

export type ClipKind = "pronunciation" | "sentence";

export type Clip = {
  src: string;
  wordId: string;
  kind: ClipKind;
  fromAutoplay: boolean;
};

type UseAudioPlayerProps = {
  onEnded?: (clip: Clip) => void;
  onError?: (clip: Clip | null, error: unknown) => void;
  onBlocked?: (clip: Clip | null) => void;
};

export function useAudioPlayer({
  onEnded,
  onError,
  onBlocked,
}: UseAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clipRef = useRef<Clip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);

  // Keep the latest callbacks in refs so the audio element can be created once
  // (empty dependency array) without going stale. Depending on the callbacks
  // directly would recreate the <audio> element on every render and abort any
  // clip that is currently playing.
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);
  const onBlockedRef = useRef(onBlocked);
  useEffect(() => {
    onEndedRef.current = onEnded;
    onErrorRef.current = onError;
    onBlockedRef.current = onBlocked;
  }, [onEnded, onError, onBlocked]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleEnded = () => {
      setIsPlaying(false);
      if (clipRef.current && onEndedRef.current) {
        onEndedRef.current(clipRef.current);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = (event: Event) => {
      setIsPlaying(false);

      const audioErr = (event as ErrorEvent).error || audioRef.current?.error;
      const errName = (audioErr as { name?: string })?.name || "";
      const errMsg = (audioErr as { message?: string })?.message || "";
      const mediaCode = (audioErr as MediaError | null)?.code;

      const isAbort =
        errName === "AbortError" || mediaCode === MediaError.MEDIA_ERR_ABORTED;
      if (isAbort) {
        // AbortError fires when a play() call is interrupted by pause() or a
        // new play() request; it isn't a real failure so we ignore it here.
        return;
      }

      const isBlocked =
        errName === "NotAllowedError" || errMsg.toLowerCase().includes("gesture");
      if (isBlocked) {
        if (onBlockedRef.current) onBlockedRef.current(clipRef.current);
        return;
      }

      if (onErrorRef.current) {
        onErrorRef.current(clipRef.current, audioErr);
      } else if (clipRef.current) {
        console.warn("Audio failed to load", clipRef.current.src, audioErr);
      }
    };
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  const playClip = useCallback(
    (clip: Clip) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      const resolvedSrc = clip.src.startsWith("http")
        ? clip.src
        : new URL(clip.src, window.location.href).toString();
      audio.src = resolvedSrc;
      audio.setAttribute("type", "audio/wav");
      audio.muted = false;
      audio.volume = 1;
      audio.currentTime = 0;
      audio.load();
      clipRef.current = clip;
      setCurrentClip(clip);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err: unknown) => {
          const errName = (err as { name?: string })?.name || "";
          const errMsg = (err as { message?: string })?.message || "";

          // AbortError happens when a play() is interrupted by pause() or a new
          // play() request. That’s expected during rapid navigation/autoplay,
          // so we treat it as a benign condition and do not surface an error.
          if (errName === "AbortError") {
            return;
          }

          const isBlocked =
            errName === "NotAllowedError" ||
            errMsg.toLowerCase().includes("gesture");
          if (isBlocked) {
            if (onBlockedRef.current) onBlockedRef.current(clip);
          } else {
            console.warn(
              "Audio play failed",
              err,
              audio.error ? `code:${audio.error.code}` : ""
            );
            if (onErrorRef.current) onErrorRef.current(clip, err);
          }
        });
    },
    []
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const preload = useCallback((src?: string) => {
    if (!src) return;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.load();
  }, []);

  return {
    playClip,
    pause,
    isPlaying,
    currentClip,
    audioRef,
    preload,
  };
}
