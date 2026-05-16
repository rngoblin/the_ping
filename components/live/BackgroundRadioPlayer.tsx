"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Radio } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const playlistId = "PLk1JTFCHeBhgiVqKUvx_2Pjogos7iTyZq";
const defaultVolume = 36;

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
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

    player.setVolume(defaultVolume);
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
  }, [isRadioFallbackActive, isReady]);

  const enableRadio = () => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.setVolume(defaultVolume);
    player.playVideo();
    setNeedsGesture(false);
  };

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed -left-10 top-0 h-px w-px overflow-hidden opacity-0">
        <div ref={containerRef} />
      </div>
      <button
        type="button"
        onClick={needsGesture ? enableRadio : undefined}
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-3 z-40 flex max-w-[calc(100vw-9.5rem)] items-center gap-2 rounded-full border border-ping-accent/35 bg-ping-surface/92 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ping-accent shadow-[0_0_24px_rgba(168,255,96,0.12)] backdrop-blur-md transition hover:border-ping-pink/40 hover:text-ping-pink sm:bottom-4 sm:left-4"
        aria-label={needsGesture ? "Enable radio ping" : "Radio ping status"}
      >
        <Radio size={13} />
        <span>radio ping</span>
        <span className="text-ping-ink/35">/</span>
        <span className="truncate">{!isRadioFallbackActive ? "paused for live" : needsGesture ? "tap to enable sound" : isRadioPlaying ? "playing" : "tuning"}</span>
      </button>
    </>
  );
}
