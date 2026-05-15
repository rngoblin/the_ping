"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { PixelSigil } from "@/components/identity/PixelSigil";
import { LivePlayer } from "@/components/live/LivePlayer";
import { ReactionBar } from "@/components/live/ReactionBar";
import { RoomList } from "@/components/rooms/RoomList";
import { RoomSwitcher } from "@/components/rooms/RoomSwitcher";
import { RoomVibe } from "@/components/rooms/RoomVibe";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";
import { SchedulePanel } from "@/components/schedule/SchedulePanel";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { TopStatus } from "@/components/shell/TopStatus";
import { usePingStore } from "@/store/usePingStore";
import { EntryGate } from "@/components/shell/EntryGate";
import { LoadingState } from "@/components/shell/LoadingState";
import { DebugPanel } from "@/components/shell/DebugPanel";
import { getRealtimeAdapter } from "@/services/realtime";
import { createPresenceUser } from "@/store/usePingStore";
import { subscribeToHostAnnouncement, subscribeToHostEventState } from "@/services/host/hostControls";

export function AppShell() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const hasHydratedSession = usePingStore((state) => state.hasHydratedSession);
  const sessionWasRestored = usePingStore((state) => state.sessionWasRestored);
  const localUser = usePingStore((state) => state.localUser);
  const featureFlags = usePingStore((state) => state.featureFlags);
  const activeAnnouncement = usePingStore((state) => state.activeAnnouncement);
  const hydrateLocalSession = usePingStore((state) => state.hydrateLocalSession);
  const hydrateTheme = usePingStore((state) => state.hydrateTheme);
  const applyHostEventState = usePingStore((state) => state.applyHostEventState);
  const setActiveAnnouncement = usePingStore((state) => state.setActiveAnnouncement);
  const setRoomMessages = usePingStore((state) => state.setRoomMessages);
  const setRoomPresence = usePingStore((state) => state.setRoomPresence);
  const setReactionCount = usePingStore((state) => state.setReactionCount);
  const receiveReaction = usePingStore((state) => state.receiveReaction);
  const rooms = usePingStore((state) => state.rooms);
  const events = usePingStore((state) => state.events);
  const activeEventId = usePingStore((state) => state.activeEventId);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const mobilePanel = usePingStore((state) => state.mobilePanel);
  const setMobilePanel = usePingStore((state) => state.setMobilePanel);
  const noteRoomEntry = usePingStore((state) => state.noteRoomEntry);
  const [showRecognizedSignal, setShowRecognizedSignal] = useState(false);
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? rooms[0];
  const activeEvent = events.find((event) => event.id === activeEventId);
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
    if (!localUser || !sessionWasRestored) {
      return;
    }

    setShowRecognizedSignal(true);
    const timeout = window.setTimeout(() => setShowRecognizedSignal(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [localUser, sessionWasRestored]);

  useEffect(() => {
    if (!localUser) {
      return;
    }

    noteRoomEntry(activeRoomId);
  }, [activeRoomId, localUser, noteRoomEntry]);

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
    const unsubscribeReactionCount = adapter.subscribeToReactionCount(activeRoomId, (count) => {
      setReactionCount(activeRoomId, count);
    });

    return () => {
      unsubscribeMessages();
      unsubscribePresence();
      unsubscribeReactionCount();
    };
  }, [activeRoomId, localUser, setReactionCount, setRoomMessages, setRoomPresence]);

  useEffect(() => {
    const unsubscribeReactions = getRealtimeAdapter().subscribeToReactions(receiveReaction);
    return unsubscribeReactions;
  }, [receiveReaction]);

  useEffect(() => {
    const unsubscribeEventState = subscribeToHostEventState(activeEventId, applyHostEventState);
    const unsubscribeAnnouncement = subscribeToHostAnnouncement(activeEventId, setActiveAnnouncement);

    return () => {
      unsubscribeEventState();
      unsubscribeAnnouncement();
    };
  }, [activeEventId, applyHostEventState, setActiveAnnouncement]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.shiftKey && (key === "d" || event.code === "KeyD") && featureFlags.enableDebugPanel) {
        event.preventDefault();
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
      <div className="ambient-motion pointer-events-none" aria-hidden="true">
        <div className="ambient-drift" />
        <div className="ambient-grid" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeRoomId}
          aria-hidden="true"
          className="room-transition-glow pointer-events-none fixed inset-0 z-[5]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.42, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </AnimatePresence>
      <AnimatePresence>
        {showRecognizedSignal && localUser ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            className="pointer-events-none fixed left-1/2 top-[calc(1rem+env(safe-area-inset-top))] z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-ping-accent/25 bg-ping-surface/88 px-3 py-2 text-ping-ink shadow-line backdrop-blur-md"
          >
            <span className="grid size-8 place-items-center rounded-md border border-ping-black/10 bg-ping-bg/80 p-1 shadow-[0_0_22px_var(--room-tint)]">
              <PixelSigil seed={localUser.avatarSeed} className="size-full signal-recognized-sigil" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ping-ink/55">signal recognized</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div className="relative z-10 min-h-dvh">
        <div className="flex w-full flex-col">
          <div className="grid flex-1 gap-3 p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:gap-4 sm:p-4 sm:pt-[calc(1rem+env(safe-area-inset-top))] sm:pb-[calc(5.5rem+env(safe-area-inset-bottom))] xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-4 xl:p-4 2xl:grid-cols-[minmax(0,1fr)_25rem]">
            <div className="min-w-0 space-y-4">
              <div className="flex items-center justify-center gap-3 py-1 lg:justify-start">
                <PingGlyph className="size-8" />
                <PingWordmark compact />
              </div>
              <TopStatus onOpenHostPanel={featureFlags.enableDebugPanel ? () => setIsDebugOpen(true) : undefined} />
              {activeAnnouncement ? (
                <aside className="rounded-md border border-ping-pink/20 bg-ping-softPink/10 px-4 py-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-ping-ink/65">
                  <span className="text-ping-pink">host signal</span>
                  <span className="mx-2 text-ping-ink/25">/</span>
                  {activeAnnouncement.body}
                </aside>
              ) : null}
              <section id="live-section" className="scroll-mt-6">
                <LivePlayer />
              </section>
              <ReactionBar />
              <RoomSwitcher />

              <div id="rooms-section" className="grid scroll-mt-6 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="hidden lg:block">
                  <RoomList />
                </div>
                <ChatPanel />
              </div>
            </div>

            <aside className="hidden content-start gap-4 xl:grid xl:grid-cols-1">
              <section id="schedule-section" className="scroll-mt-6">
                <SchedulePanel onOpenFullSchedule={openFullSchedule} />
              </section>
              <section id="vibe-section" className="scroll-mt-6">
                <RoomVibe />
              </section>
              <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line">
                <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">people here</h2>
                <div className="flex -space-x-2">
                  {(activePresence?.avatars.length ? activePresence.avatars : ["salma:0", "niko:1", "mei:2", "lo:0", "ve:1", "june:2", "anna:0"]).map((avatar, index) => (
                    <div
                      key={`${avatar}-${index}`}
                      className="grid size-9 place-items-center rounded-md border-2 border-ping-surface bg-ping-muted/75 p-1 shadow-line"
                    >
                      <PixelSigil seed={avatar} className="size-full" title="presence signal sigil" />
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
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3 z-40 rounded-full border border-ping-black/10 bg-ping-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ping-ink/45 shadow-line backdrop-blur transition hover:border-ping-accent/40 hover:text-ping-accent lg:bottom-3"
        >
          host
        </button>
      ) : null}
      {activeEvent?.feedbackUrl ? (
        <a
          href={activeEvent.feedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-3 z-40 rounded-full border border-ping-black/10 bg-ping-surface/90 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-ping-ink/45 shadow-line backdrop-blur transition hover:border-ping-pink/35 hover:text-ping-pink lg:bottom-3"
        >
          leave feedback
        </a>
      ) : null}
    </main>
  );
}
