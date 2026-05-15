"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePingStore } from "@/store/usePingStore";
import { normalizeStreamEmbedUrl } from "@/utils/streamSources";

function StreamFallback({ copy = "stream signal unavailable" }: { copy?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] grid place-items-center bg-ping-black text-ping-bg">
      <div className="max-w-sm px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ping-accent">signal quiet</p>
        <p className="mt-3 text-sm leading-relaxed text-ping-bg/65">{copy}</p>
      </div>
    </div>
  );
}

export function StreamEmbed() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasStreamError, setHasStreamError] = useState(false);
  const currentLive = usePingStore((state) => state.currentLive);
  const isPlaying = usePingStore((state) => state.isPlaying);
  const isMuted = usePingStore((state) => state.isMuted);
  const volume = usePingStore((state) => state.volume);
  const embedUrl = useMemo(
    () =>
      normalizeStreamEmbedUrl({
        streamType: currentLive.streamType,
        embedUrl: currentLive.embedUrl,
        streamUrl: currentLive.streamUrl,
        origin: typeof window !== "undefined" ? window.location.origin : undefined
      }),
    [currentLive.embedUrl, currentLive.streamType, currentLive.streamUrl]
  );
  const hasEmbed = embedUrl && currentLive.streamType !== "placeholder";
  const hasHls = currentLive.streamType === "hls" && currentLive.streamUrl;

  useEffect(() => {
    setHasStreamError(false);
  }, [currentLive.status, currentLive.streamType, currentLive.streamUrl, embedUrl]);

  useEffect(() => {
    if (currentLive.status !== "live") {
      return;
    }

    if (currentLive.streamType === "youtube") {
      const sendCommand = (func: string, args: unknown[] = []) => {
        iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*");
      };

      sendCommand(isPlaying ? "playVideo" : "pauseVideo");
      sendCommand(isMuted ? "mute" : "unMute");
      sendCommand("setVolume", [isMuted ? 0 : volume]);
      return;
    }

    if (currentLive.streamType === "hls" && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = Math.max(0, Math.min(1, volume / 100));

      if (isPlaying) {
        void videoRef.current.play().catch(() => undefined);
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentLive.status, currentLive.streamType, isMuted, isPlaying, volume]);

  if (currentLive.status !== "live") {
    return null;
  }

  if (!isPlaying && (currentLive.streamType === "youtube" || currentLive.streamType === "twitch" || currentLive.streamType === "hls")) {
    return null;
  }

  if (hasStreamError) {
    return <StreamFallback />;
  }

  if (currentLive.streamType !== "placeholder" && !hasEmbed && !hasHls) {
    return <StreamFallback copy="host has not set a playable stream url yet" />;
  }

  if (hasEmbed && (currentLive.streamType === "youtube" || currentLive.streamType === "twitch")) {
    return (
      <iframe
        ref={iframeRef}
        key={`${currentLive.streamType}:${embedUrl}`}
        src={embedUrl}
        title={`${currentLive.title} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        onError={() => setHasStreamError(true)}
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: isMuted ? "mute" : "unMute", args: [] }), "*");
          iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: isPlaying ? "playVideo" : "pauseVideo", args: [] }), "*");
        }}
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 z-[1] h-full w-full border-0 opacity-100"
      />
    );
  }

  if (hasHls) {
    return (
      <video
        ref={videoRef}
        key={currentLive.streamUrl}
        src={currentLive.streamUrl}
        className="absolute inset-0 z-[1] h-full w-full object-cover opacity-100"
        onError={() => setHasStreamError(true)}
        autoPlay
        muted={isMuted}
        loop
        playsInline
        controls
      />
    );
  }

  return null;
}
