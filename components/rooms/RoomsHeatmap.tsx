"use client";

import type { CSSProperties } from "react";
import { Activity } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

const roomPositions: Record<string, { x: number; y: number }> = {
  "main-floor": { x: 50, y: 48 },
  "smoking-area": { x: 33, y: 61 },
  shitposting: { x: 66, y: 62 },
  "visuals-art": { x: 36, y: 35 },
  "producers-lair": { x: 64, y: 36 },
  ambient: { x: 50, y: 70 }
};

const heatColor = (heat: number) => {
  const hue = 92 - heat * 42;
  const lightness = 34 + heat * 18;
  const saturation = 28 + heat * 34;
  return `hsl(${hue}deg ${saturation}% ${lightness}%)`;
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
    <section className="rooms-heatmap-panel rounded-md border border-ping-black/8 bg-ping-surface/62 p-4 shadow-line transition-colors">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">rooms heatmap</h2>
        <Activity size={15} className="text-ping-accent" />
      </div>
      <div className="relative h-44 overflow-hidden rounded-md border border-ping-black/8 bg-ping-bg/46">
        <div className="absolute inset-0 opacity-26 [background-image:linear-gradient(rgba(94,122,100,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(94,122,100,0.12)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="pointer-events-none absolute inset-0 opacity-34 [background-image:radial-gradient(circle_at_36%_36%,rgba(168,255,96,0.18),transparent_4.5rem),radial-gradient(circle_at_64%_38%,rgba(127,162,135,0.16),transparent_4.25rem),radial-gradient(circle_at_50%_62%,rgba(217,160,92,0.12),transparent_5.5rem),radial-gradient(circle_at_34%_62%,rgba(255,90,124,0.10),transparent_3.75rem),radial-gradient(circle_at_66%_64%,rgba(168,255,96,0.13),transparent_4rem)]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(168,255,96,0.24)_0.7px,transparent_0.8px),radial-gradient(rgba(217,160,92,0.13)_0.6px,transparent_0.7px)] [background-position:0_0,6px_7px] [background-size:11px_11px,13px_13px]" />
        {rooms.map((room) => {
          const presence = presenceByRoom[room.id]?.count ?? 0;
          const reactions = reactionCountsByRoom[room.id] ?? 0;
          const heat = Math.min(1, room.vibe / 170 + (presence / maxPresence) * 0.28 + (reactions / maxReactions) * 0.22);
          const size = 0.9 + heat * 2.4;
          const isActive = room.id === activeRoomId;
          const position = roomPositions[room.id] ?? { x: 50, y: 50 };
          const color = heatColor(heat);

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
                  borderColor: isActive ? "rgb(var(--color-accent))" : "rgba(127, 162, 135, 0.26)",
                  backgroundColor: color,
                  opacity: 0.36 + heat * 0.42,
                  boxShadow: `0 0 ${Math.round(10 + heat * 28)}px ${color}`
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
