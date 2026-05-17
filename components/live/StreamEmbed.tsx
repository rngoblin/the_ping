"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const VIDEO_ID = "FzmkttWQNPE";
const START_HOUR = 21;
const START_MINUTE = 0;
const CHECK_INTERVAL_MS = 15_000;
const YOUTUBE_EMBED_SRC = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=1&playsinline=1`;
const STREAM_COVER_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ping-stream-cover.png`;

const isAfterStartTime = () => {
  const now = new Date();
  const start = new Date();
  start.setHours(START_HOUR, START_MINUTE, 0, 0);
  return now >= start;
};

function StreamBadge({ children }: { children: string }) {
  return (
    <div className="absolute left-3 top-3 z-[13] rounded-full border border-ping-accent/35 bg-ping-black/75 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ping-accent backdrop-blur-md">
      {children}
    </div>
  );
}

export function StreamEmbed() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const checkAvailability = () => setIsAvailable(isAfterStartTime());
    checkAvailability();

    const interval = window.setInterval(checkAvailability, CHECK_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  if (!isAvailable) {
    return (
      <div className="absolute inset-0 z-[12] overflow-hidden border border-ping-accent/25 bg-ping-black text-ping-bg">
        <Image src={STREAM_COVER_SRC} alt="" fill sizes="100vw" priority className="theme-cover-art object-cover" />
        <StreamBadge>scheduled 21:00</StreamBadge>
        <div className="sr-only">
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-ping-accent sm:text-base">stream starts at 21:00</p>
          <p className="mt-2 text-sm leading-relaxed text-ping-bg/60">Waiting for signal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StreamBadge>on air</StreamBadge>
      <iframe
        src={YOUTUBE_EMBED_SRC}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute inset-0 z-[1] h-full w-full border-0"
      />
    </>
  );
}
