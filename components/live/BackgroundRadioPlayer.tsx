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
  const playerPromiseRef = useRef<Promise<YouTubePlayer | null> | null>(null);
  const blockedCheckRef = useRef<number | null>(null);
  const unloadTimerRef = useRef<number | null>(null);
  const userEnabledRef = useRef(false);
  const currentLive = usePingStore((state) => state.currentLive);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);

  const isLiveStreamActive = useMemo(
    () => currentLive.status === "live" && currentLive.streamType !== "placeholder" && Boolean(currentLive.embedUrl || currentLive.streamUrl),
    [currentLive.embedUrl, currentLive.status, currentLive.streamType, currentLive.streamUrl]
  );
  const isRadioFallbackActive = !isLiveStreamActive;

  const clearUnloadTimer = () => {
    if (unloadTimerRef.current) {
      window.clearTimeout(unloadTimerRef.current);
      unloadTimerRef.current = null;
    }
  };

  const unloadPlayer = () => {
    clearUnloadTimer();

    if (blockedCheckRef.current) {
      window.clearTimeout(blockedCheckRef.current);
      blockedCheckRef.current = null;
    }

    playerRef.current?.destroy();
    playerRef.current = null;
    playerPromiseRef.current = null;
    setIsReady(false);
    setIsLoading(false);
    setIsRadioPlaying(false);
  };

  const schedulePausedUnload = () => {
    clearUnloadTimer();
    unloadTimerRef.current = window.setTimeout(unloadPlayer, 120_000);
  };

  const ensurePlayer = () => {
    if (playerRef.current) {
      return Promise.resolve(playerRef.current);
    }

    playerPromiseRef.current ??= new Promise<YouTubePlayer | null>((resolve) => {
      setIsLoading(true);

      void loadYoutubeIframeApi().then(() => {
        if (!containerRef.current || !window.YT?.Player) {
          setIsLoading(false);
          resolve(null);
          return;
        }

        playerRef.current = new window.YT.Player(containerRef.current, {
          width: "1",
          height: "1",
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            list: playlistId,
            listType: "playlist",
            modestbranding: 1,
            origin: window.location.origin,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(defaultVolume);
              event.target.setLoop?.(true);
              setIsReady(true);
              setIsLoading(false);
              resolve(event.target);
            },
            onStateChange: (event) => {
              if (event.data === window.YT?.PlayerState?.PLAYING) {
                clearUnloadTimer();
                setIsRadioPlaying(true);
                setNeedsGesture(false);
              }
              if (event.data === window.YT?.PlayerState?.PAUSED) {
                setIsRadioPlaying(false);
                schedulePausedUnload();
              }
            },
            onError: () => {
              setIsLoading(false);
              setNeedsGesture(true);
            }
          }
        });
      });
    });

    return playerPromiseRef.current;
  };

  useEffect(
    () => () => {
      if (blockedCheckRef.current) {
        window.clearTimeout(blockedCheckRef.current);
      }

      unloadPlayer();
    },
    []
  );

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (!isRadioFallbackActive) {
      player.pauseVideo();
      unloadPlayer();
      setNeedsGesture(false);
      return;
    }

    if (!userEnabledRef.current || !isReady) {
      return;
    }

    player.setVolume(defaultVolume);
    player.playVideo();
    clearUnloadTimer();

    if (blockedCheckRef.current) {
      window.clearTimeout(blockedCheckRef.current);
    }

    blockedCheckRef.current = window.setTimeout(() => {
      const state = player.getPlayerState?.();

      if (isRadioFallbackActive && state !== window.YT?.PlayerState?.PLAYING) {
        setNeedsGesture(true);
      }
    }, 1400);
  }, [isRadioFallbackActive, isReady]);

  const enableRadio = () => {
    userEnabledRef.current = true;

    void ensurePlayer().then((player) => {
      if (!player || !isRadioFallbackActive) {
        return;
      }

      player.setVolume(defaultVolume);
      player.playVideo();
      setNeedsGesture(false);
    });
  };

  const toggleRadio = () => {
    if (!isRadioFallbackActive) {
      return;
    }

    if (!playerRef.current) {
      enableRadio();
      return;
    }

    const player = playerRef.current;

    if (isRadioPlaying) {
      userEnabledRef.current = false;
      player.pauseVideo();
      unloadPlayer();
      return;
    }

    userEnabledRef.current = true;
    player.setVolume(defaultVolume);
    player.playVideo();
    clearUnloadTimer();
    setNeedsGesture(false);
  };

  const goToPrevious = () => {
    if (!isRadioFallbackActive) {
      return;
    }

    if (!playerRef.current) {
      enableRadio();
      return;
    }

    playerRef.current.previousVideo();
  };

  const goToNext = () => {
    if (!isRadioFallbackActive) {
      return;
    }

    if (!playerRef.current) {
      enableRadio();
      return;
    }

    playerRef.current.nextVideo();
  };

  const controlsDisabled = !isRadioFallbackActive;

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed -left-10 top-0 h-px w-px overflow-hidden opacity-0">
        <div ref={containerRef} />
      </div>
      <section
        className="radio-widget h-9 w-32 shrink-0 rounded-md border border-ping-black/10 bg-ping-surface/90 p-1 text-ping-ink shadow-line backdrop-blur-md sm:w-40"
        aria-label="Radio ping controls"
        title={!isRadioFallbackActive ? "Radio paused for live stream" : needsGesture ? "Tap play to enable radio" : "Radio ping"}
      >
        <div className="grid h-full grid-cols-3 gap-1">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={controlsDisabled}
            className="grid h-full place-items-center rounded border border-ping-black/10 bg-ping-bg/70 text-ping-ink transition hover:border-ping-accent/45 hover:text-ping-accent disabled:cursor-default disabled:opacity-35"
            aria-label="Previous radio track"
            title="Previous"
          >
            <SkipBack size={15} fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={needsGesture ? enableRadio : toggleRadio}
            disabled={!isRadioFallbackActive || isLoading}
            className="grid h-full place-items-center rounded border border-ping-accent/35 bg-ping-accent/12 text-ping-accent transition hover:border-ping-pink/45 hover:text-ping-pink disabled:cursor-default disabled:opacity-35"
            aria-label={isRadioPlaying ? "Pause radio" : "Play radio"}
            title={isLoading ? "Tuning" : isRadioPlaying ? "Pause" : "Play"}
          >
            {isRadioPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={controlsDisabled}
            className="grid h-full place-items-center rounded border border-ping-black/10 bg-ping-bg/70 text-ping-ink transition hover:border-ping-accent/45 hover:text-ping-accent disabled:cursor-default disabled:opacity-35"
            aria-label="Next radio track"
            title="Next"
          >
            <SkipForward size={15} fill="currentColor" />
          </button>
        </div>
      </section>
    </>
  );
}
