"use client";

import type { CSSProperties } from "react";
import { usePingStore } from "@/store/usePingStore";

export function VenueAtmosphere() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const room = rooms.find((item) => item.id === activeRoomId) ?? rooms[0];

  return (
    <div className="venue-atmosphere absolute inset-0" style={{ "--room-tint": room.tint } as CSSProperties}>
      <div className="venue-haze" />
      <div className="venue-silhouettes">
        {Array.from({ length: 15 }).map((_, index) => (
          <span key={index} style={{ "--i": index, height: `${34 + (index % 5) * 8}%` } as CSSProperties} />
        ))}
      </div>
      <div className="venue-lines" />
    </div>
  );
}
