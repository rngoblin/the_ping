"use client";

import type { CSSProperties } from "react";
import { Activity } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const roomPositions: Record<string, { x: number; y: number }> = {
  "main-floor": { x: 50, y: 46 },
  "smoking-area": { x: 22, y: 66 },
  shitposting: { x: 72, y: 68 },
  "visuals-art": { x: 31, y: 28 },
  "producers-lair": { x: 68, y: 27 },
  ambient: { x: 48, y: 76 }
};

export function RoomsHeatmap() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const reactionCountsByRoom = usePingStore((state) => state.reactionCountsByRoom);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);
  const maxPresence = Math.max(1, ...rooms.map((room) => presenceByRoom[room.id]?.count ?? 0));
  const maxReactions = Math.max(1, ...rooms.map((room) => reactionCountsByRoom[room.id] ?? 0));

  return (
    <section className="rooms-heatmap-panel rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line transition-colors">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">rooms heatmap</h2>
        <Activity size={15} className="text-ping-accent" />
      </div>
      <div className="relative h-52 overflow-hidden rounded-md border border-ping-black/10 bg-ping-bg/55">
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(94,122,100,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(94,122,100,0.13)_1px,transparent_1px)] [background-size:32px_32px]" />
        {rooms.map((room) => {
          const presence = presenceByRoom[room.id]?.count ?? 0;
          const reactions = reactionCountsByRoom[room.id] ?? 0;
          const heat = Math.min(1, room.vibe / 170 + (presence / maxPresence) * 0.28 + (reactions / maxReactions) * 0.22);
          const size = 0.9 + heat * 2.4;
          const isActive = room.id === activeRoomId;
          const position = roomPositions[room.id] ?? { x: 50, y: 50 };

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoom(room.id)}
              aria-label={`Open ${room.name}`}
              title={`${room.name}: ${presence.toLocaleString()} inside`}
              className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border transition hover:scale-110"
              style={
                {
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${size}rem`,
                  height: `${size}rem`,
                  borderColor: isActive ? "rgb(var(--color-accent))" : "rgba(94, 122, 100, 0.28)",
                  backgroundColor: room.accent,
                  opacity: 0.34 + heat * 0.58,
                  boxShadow: `0 0 ${Math.round(16 + heat * 42)}px ${room.accent}`
                } as CSSProperties
              }
            >
              <span className="size-1.5 rounded-full bg-ping-bg/85" />
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {rooms.map((room) => {
          const presence = presenceByRoom[room.id]?.count ?? 0;
          const isActive = room.id === activeRoomId;

          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setActiveRoom(room.id)}
              className={`flex min-w-0 items-center gap-2 text-left font-mono text-[10px] uppercase tracking-[0.08em] ${
                isActive ? "text-ping-accent" : "text-ping-ink/45 hover:text-ping-ink/65"
              }`}
            >
              <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: room.accent }} />
              <span className="min-w-0 truncate">{room.name}</span>
              <span className="ml-auto text-ping-ink/35">{presence}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
