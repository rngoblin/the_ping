"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { TestEventBanner } from "@/components/event/TestEventBanner";
import { PixelSigil } from "@/components/identity/PixelSigil";
import { BackgroundRadioPlayer } from "@/components/live/BackgroundRadioPlayer";
import { LivePlayer } from "@/components/live/LivePlayer";
import { RoomList } from "@/components/rooms/RoomList";
import { PeopleHere } from "@/components/rooms/PeopleHere";
import { RoomSwitcher } from "@/components/rooms/RoomSwitcher";
import { RoomsHeatmap } from "@/components/rooms/RoomsHeatmap";
import { BottomSheet } from "@/components/shell/BottomSheet";
import { MobileBottomNav } from "@/components/shell/MobileBottomNav";
import { SchedulePanel } from "@/components/schedule/SchedulePanel";
import { ScheduleDrawer } from "@/components/schedule/ScheduleDrawer";
import { TopStatus } from "@/components/shell/TopStatus";
import { usePingStore } from "@/store/usePingStore";
import { EntryGate } from "@/components/shell/EntryGate";
import { LoadingState } from "@/components/shell/LoadingState";
import { getRealtimeAdapter } from "@/services/realtime";
import { createPresenceUser } from "@/store/usePingStore";
import { subscribeToHostAnnouncement, subscribeToHostEventState } from "@/services/host/hostControls";
import { subscribeToModerationActions } from "@/services/host/moderation";
import { FeedbackButton, FeedbackModal } from "@/components/shell/FeedbackModal";
import { tomorrowTestEvent } from "@/data/testEvent";
import { debugPing } from "@/utils/debugPing";

export function AppShell() {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const hasHydratedSession = usePingStore((state) => state.hasHydratedSession);
  const sessionWasRestored = usePingStore((state) => state.sessionWasRestored);
  const localUser = usePingStore((state) => state.localUser);
  const featureFlags = usePingStore((state) => state.featureFlags);
  const activeAnnouncement = usePingStore((state) => state.activeAnnouncement);
  const hydrateLocalSession = usePingStore((state) => state.hydrateLocalSession);
  const hydrateTheme = usePingStore((state) => state.hydrateTheme);
  const hydratePerformanceMode = usePingStore((state) => state.hydratePerformanceMode);
  const setMotionReduced = usePingStore((state) => state.setMotionReduced);
  const setPageVisible = usePingStore((state) => state.setPageVisible);
  const applyHostEventState = usePingStore((state) => state.applyHostEventState);
  const setActiveAnnouncement = usePingStore((state) => state.setActiveAnnouncement);
  const setRoomMessages = usePingStore((state) => state.setRoomMessages);
  const setRoomChatStatus = usePingStore((state) => state.setRoomChatStatus);
  const setRoomPresence = usePingStore((state) => state.setRoomPresence);
  const setModerationActions = usePingStore((state) => state.setModerationActions);
  const setReactionCount = usePingStore((state) => state.setReactionCount);
  const receiveReaction = usePingStore((state) => state.receiveReaction);
  const isLowPowerMode = usePingStore((state) => state.isLowPowerMode);
  const isMotionReduced = usePingStore((state) => state.isMotionReduced);
  const isPageVisible = usePingStore((state) => state.isPageVisible);
  const rooms = usePingStore((state) => state.rooms);
  const events = usePingStore((state) => state.events);
  const activeEventId = usePingStore((state) => state.activeEventId);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const mobilePanel = usePingStore((state) => state.mobilePanel);
  const setMobilePanel = usePingStore((state) => state.setMobilePanel);
  const setActiveRoom = usePingStore((state) => state.setActiveRoom);
  const noteRoomEntry = usePingStore((state) => state.noteRoomEntry);
  const [showRecognizedSignal, setShowRecognizedSignal] = useState(false);
  const activeRoom = rooms.find((room) => room.id === activeRoomId) ?? rooms[0];
  const activeEvent = events.find((event) => event.id === activeEventId);
  const activePresence = presenceByRoom[activeRoomId];
  const openFullSchedule = () => {
    setMobilePanel("none");
    setIsScheduleOpen(true);
  };
  const returnHome = useCallback(() => {
    setMobilePanel("none");
    setActiveRoom("main-floor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [setActiveRoom, setMobilePanel]);
  const joinTestEvent = useCallback(() => {
    setMobilePanel("none");
    setActiveRoom(tomorrowTestEvent.roomId);
    window.requestAnimationFrame(() => {
      document.getElementById("rooms-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [setActiveRoom, setMobilePanel]);

  useEffect(() => {
    hydrateLocalSession();
    hydrateTheme();
    hydratePerformanceMode();
  }, [hydrateLocalSession, hydratePerformanceMode, hydrateTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = () => setMotionReduced(mediaQuery.matches);
    const handleVisibilityChange = () => setPageVisible(document.visibilityState === "visible");

    handleMotionChange();
    handleVisibilityChange();
    mediaQuery.addEventListener("change", handleMotionChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [setMotionReduced, setPageVisible]);

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

    debugPing("room/session state", { activeRoomId, userId: localUser.userId, nickname: localUser.nickname });
    noteRoomEntry(activeRoomId);
  }, [activeRoomId, localUser, noteRoomEntry]);

  useEffect(() => {
    if (!isPageVisible) {
      return () => undefined;
    }

    const adapter = getRealtimeAdapter();
    setRoomChatStatus(activeRoomId, "loading");
    const unsubscribeMessages = adapter.subscribeToRoomMessages(
      activeRoomId,
      (messages) => {
        setRoomMessages(activeRoomId, messages);
      },
      (status, error) => {
        setRoomChatStatus(activeRoomId, status, error);
      }
    );
    const unsubscribeReactionCount = adapter.subscribeToReactionCount(activeRoomId, (count) => {
      setReactionCount(activeRoomId, count);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeReactionCount();
    };
  }, [activeRoomId, isPageVisible, setReactionCount, setRoomChatStatus, setRoomMessages]);

  useEffect(() => {
    if (!isPageVisible) {
      return () => undefined;
    }

    const adapter = getRealtimeAdapter();
    const unsubscribe = adapter.subscribeToPresence(
      activeRoomId,
      (presence) => {
        setRoomPresence(activeRoomId, presence);
      },
      localUser ? createPresenceUser(localUser, activeRoomId) : undefined
    );

    return () => {
      unsubscribe();
    };
  }, [activeRoomId, isPageVisible, localUser, setRoomPresence]);

  useEffect(() => {
    if (!isPageVisible || rooms.length === 0) {
      return () => undefined;
    }

    const adapter = getRealtimeAdapter();
    const inactiveRoomIds = rooms.map((room) => room.id).filter((roomId) => roomId !== activeRoomId);
    let isActive = true;

    const refreshInactivePresence = () => {
      void adapter.fetchPresenceCounts(inactiveRoomIds).then((counts) => {
        if (!isActive) {
          return;
        }

        Object.entries(counts).forEach(([roomId, count]) => {
          setRoomPresence(roomId, { roomId, count, avatars: [], users: [] });
        });
      });
    };

    refreshInactivePresence();
    const interval = window.setInterval(refreshInactivePresence, isLowPowerMode || isMotionReduced ? 120_000 : 60_000);
    window.addEventListener("focus", refreshInactivePresence);

    return () => {
      isActive = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshInactivePresence);
    };
  }, [activeRoomId, isLowPowerMode, isMotionReduced, isPageVisible, rooms, setRoomPresence]);

  useEffect(() => {
    if (!isPageVisible) {
      return () => undefined;
    }

    const unsubscribeReactions = getRealtimeAdapter().subscribeToReactions(receiveReaction, activeRoomId);
    return unsubscribeReactions;
  }, [activeRoomId, isPageVisible, receiveReaction]);

  useEffect(() => {
    const unsubscribeEventState = subscribeToHostEventState(activeEventId, applyHostEventState);
    const unsubscribeAnnouncement = subscribeToHostAnnouncement(activeEventId, setActiveAnnouncement);
    const unsubscribeModeration = subscribeToModerationActions(activeEventId, setModerationActions);

    return () => {
      unsubscribeEventState();
      unsubscribeAnnouncement();
      unsubscribeModeration();
    };
  }, [activeEventId, applyHostEventState, setActiveAnnouncement, setModerationActions]);

  if (!hasHydratedSession) {
    return <LoadingState />;
  }

  if (featureFlags.enableEntryGate && !localUser) {
    return <EntryGate />;
  }

  return (
    <main
      className="ping-app min-h-dvh w-full max-w-full overflow-x-hidden bg-ping-bg/80 transition-colors"
      style={
        {
          "--room-tint": activeRoom.tint,
          "--room-accent": activeRoom.accent
        } as CSSProperties
      }
    >
      <div className="noise" />
      {!isLowPowerMode && !isMotionReduced && isPageVisible ? (
        <div className="ambient-motion pointer-events-none" aria-hidden="true">
          <div className="ambient-drift" />
          <div className="ambient-grid" />
        </div>
      ) : null}
      {!isLowPowerMode && !isMotionReduced && isPageVisible ? (
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
      ) : null}
      <AnimatePresence>
        {showRecognizedSignal && localUser && !isLowPowerMode && !isMotionReduced && isPageVisible ? (
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
              <div className="flex min-w-0 items-start justify-between gap-3 py-1">
                <button
                  type="button"
                  onClick={returnHome}
                  className="flex min-w-0 cursor-pointer items-center justify-start gap-3 text-left"
                  aria-label="Return to start page"
                  title="Return to start page"
                >
                  <PingGlyph className="size-8 shrink-0" />
                  <PingWordmark compact />
                </button>
                <BackgroundRadioPlayer />
              </div>
              <TopStatus />
              <TestEventBanner onJoin={joinTestEvent} />
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
              <RoomSwitcher />

              <div id="rooms-section" className="scroll-mt-6">
                <ChatPanel />
              </div>
            </div>

            <aside className="hidden content-start gap-4 xl:grid xl:grid-cols-1">
              <RoomList compact />
              <section id="schedule-section" className="scroll-mt-6">
                <SchedulePanel onOpenFullSchedule={openFullSchedule} />
              </section>
              <section id="heatmap-section" className="scroll-mt-6">
                <RoomsHeatmap />
              </section>
              <PeopleHere presence={activePresence} />
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
      <BottomSheet isOpen={mobilePanel === "vibe"} title="rooms heatmap" onClose={() => setMobilePanel("none")}>
        <RoomsHeatmap />
        <div className="mt-4">
          <PeopleHere presence={activePresence} />
        </div>
      </BottomSheet>
      <ScheduleDrawer isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} />
      {activeEvent?.feedbackUrl ? (
        <FeedbackButton onClick={() => setIsFeedbackOpen(true)} />
      ) : null}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </main>
  );
}
