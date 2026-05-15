"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePingStore } from "@/store/usePingStore";

export function StreamEmbed() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const currentLive = usePingStore((state) => state.currentLive);
  const isPlaying = usePingStore((state) => state.isPlaying);
  const isMuted = usePingStore((state) => state.isMuted);
  const volume = usePingStore((state) => state.volume);
  const hasEmbed = currentLive.embedUrl && currentLive.streamType !== "placeholder";
  const hasHls = currentLive.streamType === "hls" && currentLive.streamUrl;
  const embedUrl = useMemo(() => {
    if (!currentLive.embedUrl) {
      return "";
    }

    try {
      const url = new URL(currentLive.embedUrl);
      url.searchParams.set("enablejsapi", "1");
      url.searchParams.set("playsinline", "1");

      if (typeof window !== "undefined") {
        url.searchParams.set("origin", window.location.origin);
      }

      return url.toString();
    } catch {
      return currentLive.embedUrl;
    }
  }, [currentLive.embedUrl]);

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

  if (hasEmbed && (currentLive.streamType === "youtube" || currentLive.streamType === "twitch")) {
    return (
      <iframe
        ref={iframeRef}
        key={`${currentLive.streamType}:${embedUrl}`}
        src={embedUrl}
        title={`${currentLive.title} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
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
