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
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
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
        playsInline
        controls={false}
      />
    );
  }

  return null;
}
