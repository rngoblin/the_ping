"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

const VIDEO_ID = "FzmkttWQNPE";
const STREAM_START_AT_UTC = "2026-05-17T16:00:00.000Z";
const CHECK_INTERVAL_MS = 15_000;
const STREAM_COVER_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ping-stream-cover.png`;
export const STREAM_START_LABEL = "21:00";
const STREAM_START_TIME = new Date(STREAM_START_AT_UTC).getTime();

type StreamYouTubePlayer = {
  destroy: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

let youtubeApiPromise: Promise<void> | null = null;

const loadYouTubeApi = () => {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      const previousReady = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        resolve();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    });
  }

  return youtubeApiPromise;
};

export const isAfterStreamStartTime = () => {
  return Date.now() >= STREAM_START_TIME;
};

export const getMsUntilStreamStart = () => {
  return Math.max(0, STREAM_START_TIME - Date.now());
};

function StreamBadge({ children }: { children: ReactNode }) {
  return (
    <div className="stream-badge absolute left-3 top-3 z-[13] rounded-md border border-ping-accent/35 bg-ping-surface/88 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-accent shadow-line backdrop-blur-md">
      {children}
    </div>
  );
}

export function StreamEmbed() {
  const [isAvailable, setIsAvailable] = useState(false);
  const playerTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkAvailability = () => setIsAvailable(isAfterStreamStartTime());
    checkAvailability();

    const startTimeout = window.setTimeout(checkAvailability, getMsUntilStreamStart() + 100);
    const interval = window.setInterval(checkAvailability, CHECK_INTERVAL_MS);
    return () => {
      window.clearTimeout(startTimeout);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!isAvailable || !playerTargetRef.current) {
      return () => undefined;
    }

    let player: StreamYouTubePlayer | null = null;
    let isMounted = true;

    void loadYouTubeApi().then(() => {
      if (!isMounted || !playerTargetRef.current || !window.YT?.Player) {
        return;
      }

      player = new window.YT.Player(playerTargetRef.current, {
        width: "100%",
        height: "100%",
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 1,
          enablejsapi: 1,
          mute: 0,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            const target = event.target as unknown as StreamYouTubePlayer;
            window.setTimeout(() => {
              target.unMute();
              target.setVolume(100);
              target.playVideo();
            }, 100);
          }
        }
      }) as unknown as StreamYouTubePlayer;
    });

    return () => {
      isMounted = false;
      player?.destroy();
    };
  }, [isAvailable]);

  if (!isAvailable) {
    return (
      <div className="absolute inset-0 z-[12] overflow-hidden bg-ping-surface text-ping-ink">
        <div className="absolute inset-x-0 top-0 bottom-[3.75rem] overflow-hidden sm:bottom-[5rem]">
          <Image src={STREAM_COVER_SRC} alt="" fill sizes="100vw" priority className="theme-cover-art object-cover object-top" />
        </div>
        <div className="stream-control-band absolute inset-x-0 bottom-0 h-[3.75rem] border-t border-ping-black/10 bg-ping-surface/90 sm:h-[5rem]" />
        <StreamBadge>scheduled {STREAM_START_LABEL}</StreamBadge>
        <div className="sr-only">
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-ping-accent sm:text-base">stream starts at {STREAM_START_LABEL}</p>
          <p className="mt-2 text-sm leading-relaxed text-ping-bg/60">Waiting for signal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StreamBadge>on air</StreamBadge>
      <div ref={playerTargetRef} className="absolute inset-0 z-[1] h-full w-full [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0" />
    </>
  );
}
