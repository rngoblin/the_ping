"use client";

import { Users } from "lucide-react";
import type { CSSProperties } from "react";
import { usePingStore } from "@/store/usePingStore";

export function RoomVibe() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? rooms[0];
  const presence = presenceByRoom[activeRoom.id];

  return (
    <section
      className="room-vibe-panel rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line transition-colors"
      style={{ "--active-room-tint": activeRoom.tint } as CSSProperties}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">room vibe</h2>
        <span className="font-mono text-[10px] uppercase text-ping-accent">active</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-medium">{activeRoom.name}</p>
          <p className="mt-1 text-sm text-ping-ink/55">{activeRoom.tagline}</p>
          <p className="mt-3 font-mono text-[10px] uppercase leading-relaxed text-ping-ink/45">{activeRoom.mood}</p>
        </div>
        <div className="grid size-14 shrink-0 place-items-center rounded-full border border-ping-black/10 bg-ping-bg">
          <span className="room-vibe-orb size-7 rounded-full shadow-[0_0_24px_currentColor]" style={{ backgroundColor: activeRoom.accent, color: activeRoom.accent, opacity: 0.35 }} />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex justify-between font-mono text-[10px] uppercase text-ping-ink/45">
          <span>density</span>
          <span>{activeRoom.densityLabel}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-ping-bg">
          <div className="room-vibe-meter h-full rounded-full" style={{ width: `${activeRoom.vibe}%`, backgroundColor: activeRoom.accent }} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 font-mono text-[10px] uppercase text-ping-ink/50">
        <Users size={13} />
        {(presence?.count ?? 0).toLocaleString()} people in this room
      </div>
    </section>
  );
}
