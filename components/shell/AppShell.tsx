"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { LivePlayer } from "@/components/live/LivePlayer";
import { ReactionBar } from "@/components/live/ReactionBar";
import { RoomList } from "@/components/rooms/RoomList";
import { RoomSwitcher } from "@/components/rooms/RoomSwitcher";
import { RoomVibe } from "@/components/rooms/RoomVibe";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";
import { SchedulePanel } from "@/components/schedule/SchedulePanel";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopStatus } from "@/components/shell/TopStatus";
import { usePingStore } from "@/store/usePingStore";
import { EntryGate } from "@/components/shell/EntryGate";
import { LoadingState } from "@/components/shell/LoadingState";
import { DebugPanel } from "@/components/shell/DebugPanel";
import { getRealtimeAdapter } from "@/services/realtime";
import { createPresenceUser } from "@/store/usePingStore";

export function AppShell() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const hasHydratedSession = usePingStore((state) => state.hasHydratedSession);
  const localUser = usePingStore((state) => state.localUser);
  const featureFlags = usePingStore((state) => state.featureFlags);
  const themeMode = usePingStore((state) => state.themeMode);
  const hydrateLocalSession = usePingStore((state) => state.hydrateLocalSession);
  const hydrateTheme = usePingStore((state) => state.hydrateTheme);
  const setRoomMessages = usePingStore((state) => state.setRoomMessages);
  const setRoomPresence = usePingStore((state) => state.setRoomPresence);
  const receiveReaction = usePingStore((state) => state.receiveReaction);
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const mobilePanel = usePingStore((state) => state.mobilePanel);
  const setMobilePanel = usePingStore((state) => state.setMobilePanel);
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? rooms[0];
  const activePresence = presenceByRoom[activeRoomId];
  const openFullSchedule = () => {
    setMobilePanel("none");
    setIsScheduleOpen(true);
  };

  useEffect(() => {
    hydrateLocalSession();
    hydrateTheme();
  }, [hydrateLocalSession, hydrateTheme]);

  useEffect(() => {
    const adapter = getRealtimeAdapter();
    const unsubscribeMessages = adapter.subscribeToRoomMessages(activeRoomId, (messages) => {
      setRoomMessages(activeRoomId, messages);
    });
    const unsubscribePresence = adapter.subscribeToPresence(
      activeRoomId,
      (presence) => {
        setRoomPresence(activeRoomId, presence);
      },
      localUser ? createPresenceUser(localUser, activeRoomId) : undefined
    );

    return () => {
      unsubscribeMessages();
      unsubscribePresence();
    };
  }, [activeRoomId, localUser, setRoomMessages, setRoomPresence]);

  useEffect(() => {
    const unsubscribeReactions = getRealtimeAdapter().subscribeToReactions(receiveReaction);
    return unsubscribeReactions;
  }, [receiveReaction]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "d" && featureFlags.enableDebugPanel) {
        setIsDebugOpen((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [featureFlags.enableDebugPanel]);

  if (!hasHydratedSession) {
    return <LoadingState />;
  }

  if (featureFlags.enableEntryGate && !localUser) {
    return (
      <>
        <EntryGate />
        {featureFlags.enableDebugPanel ? <DebugPanel isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} /> : null}
      </>
    );
  }

  return (
    <main
      className="ping-app min-h-dvh bg-ping-bg/80 transition-colors"
      style={
        {
          "--room-tint": activeRoom.tint,
          "--room-accent": activeRoom.accent
        } as CSSProperties
      }
    >
      <div className="noise" />
      <div className="relative z-10 flex min-h-dvh">
        <Sidebar />

        <div className="mx-auto flex w-full max-w-[118rem] flex-1 flex-col">
          <div className="safe-top sticky top-0 z-30 flex items-center justify-between border-b border-ping-black/10 bg-ping-bg/82 px-3 py-2.5 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-2.5">
              <PingGlyph className="size-7" />
              <PingWordmark compact />
            </div>
            <div className="font-mono text-[9px] uppercase text-ping-accent sm:text-[10px]">
              {themeMode === "night" ? "void luminance" : "daylight afterhours"}
            </div>
          </div>

          <div className="grid flex-1 gap-3 p-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:gap-4 sm:p-4 sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-5 xl:p-5">
            <div className="min-w-0 space-y-4">
              <TopStatus />
              <LivePlayer />
              <ReactionBar />
              <RoomSwitcher />

              <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="hidden lg:block">
                  <RoomList />
                </div>
                <ChatPanel />
              </div>
            </div>

            <aside className="hidden content-start gap-4 xl:grid xl:grid-cols-1">
              <SchedulePanel onOpenFullSchedule={openFullSchedule} />
              <RoomVibe />
              <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line">
                <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">people here</h2>
                <div className="flex -space-x-2">
                  {(activePresence?.avatars.length ? activePresence.avatars : ["SA", "NK", "ME", "LO", "VE", "JU", "AN"]).map((avatar) => (
                    <div
                      key={avatar}
                      className="grid size-9 place-items-center rounded-full border-2 border-ping-surface bg-ping-muted font-mono text-[10px] text-ping-ink/60"
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ping-ink/55">
                  {activePresence?.count ? `${activePresence.count.toLocaleString()} inside this room right now.` : "Presence is intentionally quiet: enough to feel the room, never enough to break the spell."}
                </p>
              </section>
            </aside>
          </div>
        </div>
      </div>
      <MobileBottomNav />
      <BottomSheet isOpen={mobilePanel === "rooms"} title="rooms" onClose={() => setMobilePanel("none")}>
        <RoomList />
      </BottomSheet>
      <BottomSheet isOpen={mobilePanel === "schedule"} title="schedule" onClose={() => setMobilePanel("none")}>
        <SchedulePanel onOpenFullSchedule={openFullSchedule} />
      </BottomSheet>
      <BottomSheet isOpen={mobilePanel === "vibe"} title="room vibe" onClose={() => setMobilePanel("none")}>
        <RoomVibe />
      </BottomSheet>
      <ScheduleDrawer isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      {featureFlags.enableDebugPanel ? <DebugPanel isOpen={isDebugOpen} onClose={() => setIsDebugOpen(false)} /> : null}
      {featureFlags.enableDebugPanel ? (
        <button
          onClick={() => setIsDebugOpen(true)}
          aria-label="Open host panel"
          title="Host panel"
          className="fixed bottom-2 right-2 z-30 size-3 rounded-full bg-ping-black/10 opacity-30 transition hover:opacity-80"
        />
      ) : null}
    </main>
  );
}
