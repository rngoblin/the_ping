"use client";

import { usePingStore } from "@/store/usePingStore";

export function RoomSwitcher() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);

  return (
    <div className="soft-scroll flex gap-2 overflow-x-auto pb-2 lg:hidden">
      {rooms.map((room) => {
        const isActive = activeRoomId === room.id;

        return (
          <button
            key={room.id}
            onClick={() => setActiveRoom(room.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
              isActive ? "border-ping-accent bg-ping-sage" : "border-ping-black/10 bg-ping-surface"
            }`}
          >
            <span className="mr-2 inline-block size-2 rounded-full" style={{ backgroundColor: room.accent }} />
            {room.name}
          </button>
        );
      })}
    </div>
  );
}
