"use client";

import { Copy, Trash2, X } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import type { LiveStatus } from "@/data/currentLive";
import { getRealtimeProviderName } from "@/services/realtime";

export function DebugPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const events = usePingStore((state) => state.events);
  const activeEventId = usePingStore((state) => state.activeEventId);
  const currentLive = usePingStore((state) => state.currentLive);
  const localUser = usePingStore((state) => state.localUser);
  const notifyLeads = usePingStore((state) => state.notifyLeads);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const viewerCount = usePingStore((state) => state.viewerCount);
  const setActiveEvent = usePingStore((state) => state.setActiveEvent);
  const setLiveStatus = usePingStore((state) => state.setLiveStatus);
  const clearLocalTestState = usePingStore((state) => state.clearLocalTestState);
  const resetIdentity = usePingStore((state) => state.resetIdentity);

  if (!isOpen) {
    return null;
  }

  const testState = {
    activeEventId,
    realtimeProvider: getRealtimeProviderName(),
    liveStatus: currentLive.status,
    streamType: currentLive.streamType,
    activeRoomId,
    viewerCount,
    localUser,
    notifyLeads
  };

  const copyState = () => {
    void navigator.clipboard?.writeText(JSON.stringify(testState, null, 2));
  };

  return (
    <aside className="fixed bottom-4 right-4 z-[70] max-h-[80dvh] w-[min(92vw,28rem)] overflow-hidden rounded-xl border border-ping-black/15 bg-ping-black text-ping-bg shadow-mist">
      <div className="flex items-center justify-between border-b border-ping-bg/10 p-4">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-bg/65">host panel</h2>
          <p className="mt-1 text-sm text-ping-bg/45">Shift + D</p>
        </div>
        <button onClick={onClose} aria-label="Close host panel" className="grid size-9 place-items-center rounded-full border border-ping-bg/15">
          <X size={16} />
        </button>
      </div>

      <div className="soft-scroll max-h-[calc(80dvh-4.5rem)] space-y-5 overflow-y-auto p-4">
        <section>
          <label className="mb-2 block font-mono text-[10px] uppercase text-ping-bg/45">event</label>
          <select
            value={activeEventId}
            onChange={(event) => setActiveEvent(event.target.value)}
            className="h-10 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id} className="text-ping-black">
                {event.name}
              </option>
            ))}
          </select>
        </section>

        <section>
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">live state</p>
          <div className="grid grid-cols-2 gap-2">
            {(["live", "startingSoon", "notLive", "offline"] satisfies LiveStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setLiveStatus(status)}
                className={`rounded-full border px-3 py-2 text-sm ${
                  currentLive.status === status ? "border-ping-sage bg-ping-sage text-ping-black" : "border-ping-bg/15 bg-ping-bg/10 text-ping-bg"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">realtime</p>
          <p className="font-mono text-xs uppercase text-ping-bg/70">{getRealtimeProviderName()}</p>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">local user</p>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-ping-bg/70">{JSON.stringify(localUser, null, 2)}</pre>
          <button onClick={resetIdentity} className="mt-3 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            reset identity
          </button>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">notify leads</p>
          <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-ping-bg/70">{JSON.stringify(notifyLeads, null, 2)}</pre>
        </section>

        <div className="flex flex-wrap gap-2">
          <button onClick={copyState} className="flex items-center gap-2 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            <Copy size={14} />
            copy test state
          </button>
          <button onClick={clearLocalTestState} className="flex items-center gap-2 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            <Trash2 size={14} />
            clear local data
          </button>
        </div>
      </div>
    </aside>
  );
}
