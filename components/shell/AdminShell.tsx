"use client";

import { useEffect, useState } from "react";
import { DebugPanel } from "@/components/shell/DebugPanel";
import { LoadingState } from "@/components/shell/LoadingState";
import { createPresenceUser, usePingStore } from "@/store/usePingStore";
import { getRealtimeAdapter } from "@/services/realtime";
import { subscribeToHostAnnouncement, subscribeToHostEventState } from "@/services/host/hostControls";
import { subscribeToModerationActions } from "@/services/host/moderation";

const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE || "ping-admin";

export function AdminShell() {
  const [code, setCode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const hasHydratedSession = usePingStore((state) => state.hasHydratedSession);
  const localUser = usePingStore((state) => state.localUser);
  const hydrateLocalSession = usePingStore((state) => state.hydrateLocalSession);
  const hydrateTheme = usePingStore((state) => state.hydrateTheme);
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const activeEventId = usePingStore((state) => state.activeEventId);
  const applyHostEventState = usePingStore((state) => state.applyHostEventState);
  const setActiveAnnouncement = usePingStore((state) => state.setActiveAnnouncement);
  const setModerationActions = usePingStore((state) => state.setModerationActions);
  const setRoomPresence = usePingStore((state) => state.setRoomPresence);

  useEffect(() => {
    hydrateLocalSession();
    hydrateTheme();
  }, [hydrateLocalSession, hydrateTheme]);

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    const unsubscribeEventState = subscribeToHostEventState(activeEventId, applyHostEventState);
    const unsubscribeAnnouncement = subscribeToHostAnnouncement(activeEventId, setActiveAnnouncement);
    const unsubscribeModeration = subscribeToModerationActions(activeEventId, setModerationActions);

    return () => {
      unsubscribeEventState();
      unsubscribeAnnouncement();
      unsubscribeModeration();
    };
  }, [activeEventId, applyHostEventState, isUnlocked, setActiveAnnouncement, setModerationActions]);

  useEffect(() => {
    if (!isUnlocked) {
      return;
    }

    const adapter = getRealtimeAdapter();
    const unsubscribes = rooms.map((room) =>
      adapter.subscribeToPresence(
        room.id,
        (presence) => {
          setRoomPresence(room.id, presence);
        },
        localUser && room.id === activeRoomId ? createPresenceUser(localUser, room.id) : undefined
      )
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [activeRoomId, isUnlocked, localUser, rooms, setRoomPresence]);

  if (!hasHydratedSession) {
    return <LoadingState />;
  }

  if (!isUnlocked) {
    return (
      <main className="ping-app grid min-h-dvh place-items-center bg-ping-bg p-4 text-ping-ink">
        <section className="w-full max-w-sm rounded-lg border border-ping-black/10 bg-ping-surface/90 p-5 shadow-line">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-accent">admin signal</p>
          <h1 className="mt-3 text-2xl font-semibold">PING host access</h1>
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (code === adminCode) {
                setIsUnlocked(true);
                setError("");
              } else {
                setError("wrong signal");
              }
            }}
          >
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoFocus
              placeholder="admin code"
              className="h-11 w-full rounded-md border border-ping-black/10 bg-ping-bg px-3 text-sm text-ping-ink outline-none"
            />
            <button className="h-11 w-full rounded-full border border-ping-accent/35 bg-ping-accent px-4 text-sm font-medium text-ping-bg">
              enter admin
            </button>
          </form>
          {error ? <p className="mt-3 font-mono text-[10px] uppercase text-ping-pink">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="ping-app min-h-dvh bg-ping-bg p-4 text-ping-ink">
      <DebugPanel isOpen onClose={() => undefined} />
    </main>
  );
}
