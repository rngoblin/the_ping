"use client";

import { memo, useCallback } from "react";
import { usePingStore } from "@/store/usePingStore";
import type { Room } from "@/data/rooms";

const RoomCard = memo(function RoomCard({
  room,
  isActive,
  presenceCount,
  onSelect,
  compact
}: {
  room: Room;
  isActive: boolean;
  presenceCount: number;
  onSelect: (roomId: string) => void;
  compact?: boolean;
}) {
  const handleClick = useCallback(() => onSelect(room.id), [onSelect, room.id]);
  const heightClass = compact ? (isActive ? "min-h-[4.65rem]" : "min-h-[3.55rem]") : "h-[5.85rem] lg:h-full";

  return (
    <button
      onClick={handleClick}
      className={`${heightClass} min-h-0 rounded-md border px-3 py-2.5 text-left transition ${
        isActive ? "border-ping-accent/35 bg-ping-sage/45" : "border-transparent bg-ping-bg/36 hover:border-ping-black/10 hover:bg-ping-bg/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
          <span className="size-2 rounded-full" style={{ backgroundColor: room.accent }} />
          {room.name}
        </span>
        <span className="font-mono text-[10px] text-ping-ink/45">{presenceCount}</span>
      </div>
      <p className="mt-1.5 truncate text-xs text-ping-ink/50">{room.description}</p>
      {isActive || !compact ? <p className="mt-1.5 truncate text-xs text-ping-ink/35">{room.tagline}</p> : null}
    </button>
  );
});

export function RoomList({ compact = false }: { compact?: boolean }) {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);

  return (
    <section className={`flex flex-col rounded-md border border-ping-black/10 bg-ping-surface/72 p-3 shadow-line ${compact ? "" : "lg:h-[44.75rem]"}`}>
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">rooms</h2>
        <span className="font-mono text-[10px] uppercase text-ping-accent">{rooms.length} open</span>
      </div>
      <div className={`grid gap-2 ${compact ? "" : "lg:min-h-0 lg:flex-1 lg:grid-rows-6"}`}>
        {rooms.map((room) => {
          const isActive = activeRoomId === room.id;
          const presenceCount = presenceByRoom[room.id]?.count ?? 0;

          return <RoomCard key={room.id} room={room} isActive={isActive} presenceCount={presenceCount} onSelect={setActiveRoom} compact={compact} />;
        })}
      </div>
    </section>
  );
}
