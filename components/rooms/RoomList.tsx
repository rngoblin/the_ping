"use client";

import { usePingStore } from "@/store/usePingStore";

export function RoomList() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);

  return (
    <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-3 shadow-line">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">rooms</h2>
        <span className="font-mono text-[10px] uppercase text-ping-accent">{rooms.length} open</span>
      </div>
      <div className="grid gap-1.5">
        {rooms.map((room) => {
          const isActive = activeRoomId === room.id;

          return (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`rounded-md border px-3 py-2 text-left transition ${
                isActive
                  ? "border-ping-accent/45 bg-ping-sage/70"
                  : "border-transparent bg-ping-bg/45 hover:border-ping-black/10 hover:bg-ping-bg"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                  <span className="size-2 rounded-full" style={{ backgroundColor: room.accent }} />
                  {room.name}
                </span>
                <span className="font-mono text-[10px] text-ping-ink/45">{room.count}</span>
              </div>
              <p className="mt-1 truncate text-xs text-ping-ink/50">{room.description}</p>
              <p className="mt-2 font-mono text-[10px] uppercase text-ping-ink/35">{room.tagline}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
