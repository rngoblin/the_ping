"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const playlistId = "PLk1JTFCHeBhgiVqKUvx_2Pjogos7iTyZq";
const defaultVolume = 36;

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  setVolume: (volume: number) => void;
  setLoop?: (loop: boolean) => void;
  destroy: () => void;
  getPlayerState?: () => number;
};

type YouTubePlayerEvent = {
  target: YouTubePlayer;
  data?: number;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      videoId?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: YouTubePlayerEvent) => void;
        onStateChange?: (event: YouTubePlayerEvent) => void;
        onError?: () => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState?: {
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
    UNSTARTED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

const loadYoutubeIframeApi = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  youtubeApiPromise ??= new Promise<void>((resolve) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
};

export function BackgroundRadioPlayer() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const blockedCheckRef = useRef<number | null>(null);
  const currentLive = usePingStore((state) => state.currentLive);
  const [isReady, setIsReady] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [volume, setVolume] = useState(defaultVolume);

  const isLiveStreamActive = useMemo(
    () => currentLive.status === "live" && currentLive.streamType !== "placeholder" && Boolean(currentLive.embedUrl || currentLive.streamUrl),
    [currentLive.embedUrl, currentLive.status, currentLive.streamType, currentLive.streamUrl]
  );
  const isRadioFallbackActive = !isLiveStreamActive;

  useEffect(() => {
    let isMounted = true;

    void loadYoutubeIframeApi().then(() => {
      if (!isMounted || !containerRef.current || !window.YT?.Player || playerRef.current) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        width: "1",
        height: "1",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          list: playlistId,
          listType: "playlist",
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(defaultVolume);
            event.target.setLoop?.(true);
            setIsReady(true);
          },
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState?.PLAYING) {
              setIsRadioPlaying(true);
              setNeedsGesture(false);
            }
            if (event.data === window.YT?.PlayerState?.PAUSED) {
              setIsRadioPlaying(false);
            }
          },
          onError: () => setNeedsGesture(true)
        }
      });
    });

    return () => {
      isMounted = false;

      if (blockedCheckRef.current) {
        window.clearTimeout(blockedCheckRef.current);
      }

      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;

    if (!isReady || !player) {
      return;
    }

    if (!isRadioFallbackActive) {
      player.pauseVideo();
      setIsRadioPlaying(false);
      setNeedsGesture(false);
      return;
    }

    player.setVolume(volume);
    player.playVideo();

    if (blockedCheckRef.current) {
      window.clearTimeout(blockedCheckRef.current);
    }

    blockedCheckRef.current = window.setTimeout(() => {
      const state = player.getPlayerState?.();

      if (isRadioFallbackActive && state !== window.YT?.PlayerState?.PLAYING) {
        setNeedsGesture(true);
      }
    }, 1400);
  }, [isRadioFallbackActive, isReady, volume]);

  useEffect(() => {
    playerRef.current?.setVolume(volume);
  }, [volume]);

  const enableRadio = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.setVolume(volume);
    player.playVideo();
    setNeedsGesture(false);
  };

  const toggleRadio = () => {
    const player = playerRef.current;

    if (!player || !isRadioFallbackActive) {
      return;
    }

    if (isRadioPlaying) {
      player.pauseVideo();
      setIsRadioPlaying(false);
      return;
    }

    player.setVolume(volume);
    player.playVideo();
    setNeedsGesture(false);
  };

  const goToPrevious = () => {
    if (!isRadioFallbackActive) {
      return;
    }

    playerRef.current?.previousVideo();
  };

  const goToNext = () => {
    if (!isRadioFallbackActive) {
      return;
    }

    playerRef.current?.nextVideo();
  };

  const controlsDisabled = !isReady || !isRadioFallbackActive;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed -left-10 top-0 h-px w-px overflow-hidden opacity-0">
        <div ref={containerRef} />
      </div>
      <section
        className="radio-widget w-36 shrink-0 rounded-md border border-ping-black/10 bg-ping-surface/90 p-1.5 text-ping-ink shadow-line backdrop-blur-md sm:w-44"
        aria-label="Radio ping controls"
        title={!isRadioFallbackActive ? "Radio paused for live stream" : needsGesture ? "Tap play to enable radio" : "Radio ping"}
      >
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={controlsDisabled}
            className="grid h-7 place-items-center rounded border border-ping-black/10 bg-ping-bg/70 text-ping-ink transition hover:border-ping-accent/45 hover:text-ping-accent disabled:cursor-not-allowed disabled:opacity-35 sm:h-8"
            aria-label="Previous radio track"
            title="Previous"
          >
            <SkipBack size={15} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={needsGesture ? enableRadio : toggleRadio}
            disabled={!isReady || !isRadioFallbackActive}
            className="grid h-7 place-items-center rounded border border-ping-accent/35 bg-ping-accent/12 text-ping-accent transition hover:border-ping-pink/45 hover:text-ping-pink disabled:cursor-not-allowed disabled:opacity-35 sm:h-8"
            aria-label={isRadioPlaying ? "Pause radio" : "Play radio"}
            title={isRadioPlaying ? "Pause" : "Play"}
          >
            {isRadioPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={controlsDisabled}
            className="grid h-7 place-items-center rounded border border-ping-black/10 bg-ping-bg/70 text-ping-ink transition hover:border-ping-accent/45 hover:text-ping-accent disabled:cursor-not-allowed disabled:opacity-35 sm:h-8"
            aria-label="Next radio track"
            title="Next"
          >
            <SkipForward size={15} fill="currentColor" />
          </button>
        </div>
        <input
          aria-label="Radio volume"
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
          className="mt-2 h-1 w-full accent-ping-accent"
        />
      </section>
    </>
  );
}
