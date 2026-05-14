"use client";

import { usePingStore } from "@/store/usePingStore";

export function StreamEmbed() {
  const currentLive = usePingStore((state) => state.currentLive);
  const hasEmbed = currentLive.embedUrl && currentLive.streamType !== "placeholder";
  const hasHls = currentLive.streamType === "hls" && currentLive.streamUrl;

  if (currentLive.status !== "live") {
    return null;
  }

  if (hasEmbed && (currentLive.streamType === "youtube" || currentLive.streamType === "twitch")) {
    return (
      <iframe
        key={`${currentLive.streamType}:${currentLive.embedUrl}`}
        src={currentLive.embedUrl}
        title={`${currentLive.title} stream`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 z-0 h-full w-full border-0 opacity-80"
      />
    );
  }

  if (hasHls) {
    return (
      <video
        key={currentLive.streamUrl}
        src={currentLive.streamUrl}
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-80"
        autoPlay
        muted
        loop
        playsInline
        controls={false}
      />
    );
  }

  return null;
}
