"use client";

import { usePingStore } from "@/store/usePingStore";

export function RoomList() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);

  return (
    <section className="flex flex-col rounded-lg border border-ping-black/10 bg-ping-surface/80 p-3 shadow-line lg:h-[44.75rem]">
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">rooms</h2>
        <span className="font-mono text-[10px] uppercase text-ping-accent">{rooms.length} open</span>
      </div>
      <div className="grid gap-2 lg:min-h-0 lg:flex-1 lg:grid-rows-6">
        {rooms.map((room) => {
          const isActive = activeRoomId === room.id;
          const presenceCount = presenceByRoom[room.id]?.count ?? 0;

          return (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`h-[6.35rem] min-h-0 rounded-md border px-3 py-3 text-left transition lg:h-full ${
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
                <span className="font-mono text-[10px] text-ping-ink/45">{presenceCount}</span>
              </div>
              <p className="mt-2 truncate text-xs text-ping-ink/50">{room.description}</p>
              <p className="mt-2 truncate font-mono text-[10px] uppercase text-ping-ink/35">{room.tagline}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
