"use client";

import { create } from "zustand/react";
import type { LiveStatus } from "@/data/currentLive";
import { messagesByRoom as initialMessages, type ChatMessage } from "@/data/messages";
import { rooms } from "@/data/rooms";
import type { ScheduleAct } from "@/data/schedule";
import { eventConfig, type PingEvent } from "@/data/eventConfig";
import { getRealtimeAdapter } from "@/services/realtime";
import { mockRealtime } from "@/services/realtime/mockRealtime";
import type { PresenceState, PresenceUser, ReactionInput } from "@/services/realtime/types";

export type ReactionPulse = {
  id: string;
  emoji: string;
  x: number;
  color: string;
  roomId?: string;
  userId?: string;
};

export type MobilePanel = "none" | "rooms" | "schedule" | "vibe";
export type ThemeMode = "daylight" | "night";

export type LocalUserSession = {
  userId: string;
  nickname: string;
  inviteCode?: string;
  avatarSeed: string;
};

export type NotifyLead = {
  id: string;
  actId: string;
  actTitle: string;
  contact: string;
  createdAt: string;
};

type PingStore = {
  hasHydratedSession: boolean;
  localUser: LocalUserSession | null;
  activeEventId: string;
  events: PingEvent[];
  featureFlags: PingEvent["featureFlags"];
  activeRoomId: string;
  currentLive: PingEvent["currentLive"];
  rooms: typeof rooms;
  schedule: ScheduleAct[];
  messagesByRoom: Record<string, ChatMessage[]>;
  reactions: ReactionPulse[];
  reactionCountsByRoom: Record<string, number>;
  presenceByRoom: Record<string, PresenceState>;
  notifyLeads: NotifyLead[];
  themeMode: ThemeMode;
  viewerCount: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  mobilePanel: MobilePanel;
  hydrateLocalSession: () => void;
  enterSession: (nickname: string, inviteCode?: string) => void;
  resetIdentity: () => void;
  setActiveRoom: (roomId: string) => void;
  setActiveEvent: (eventId: string) => void;
  setLiveStatus: (status: LiveStatus) => void;
  setRoomMessages: (roomId: string, messages: ChatMessage[]) => void;
  setRoomPresence: (roomId: string, presence: PresenceState) => void;
  setReactionCount: (roomId: string, count: number) => void;
  receiveReaction: (reaction: ReactionInput) => void;
  sendMessage: (message: string) => void;
  addReaction: (emoji: string) => void;
  removeReaction: (id: string) => void;
  captureNotifyLead: (lead: Omit<NotifyLead, "id" | "createdAt">) => void;
  clearLocalTestState: () => void;
  hydrateTheme: () => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setMobilePanel: (panel: MobilePanel) => void;
  togglePlaying: () => void;
  toggleMuted: () => void;
  setVolume: (volume: number) => void;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const sessionStorageKey = "ping.localSession.v03";
const notifyStorageKey = "ping.notifyLeads.v03";
const themeStorageKey = "ping.themeMode.v01";

const activeEvent = eventConfig.events.find((event) => event.id === eventConfig.currentEventId) ?? eventConfig.events[0];

const createAvatarSeed = (nickname: string) => {
  const clean = nickname.trim().slice(0, 2).toUpperCase();
  return clean || "??";
};

const loadJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const persistJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const applyThemeMode = (themeMode: ThemeMode) => {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = themeMode === "night" ? "night" : "daylight";
};

const dedupeMessages = (messages: ChatMessage[]) => {
  const seen = new Set<string>();

  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
};

export const createPresenceUser = (session: LocalUserSession, roomId: string): PresenceUser => ({
  userId: session.userId,
  nickname: session.nickname,
  avatar: session.avatarSeed,
  roomId,
  joinedAt: new Date().toISOString()
});

export const usePingStore = create<PingStore>((set, get) => ({
  hasHydratedSession: false,
  localUser: null,
  activeEventId: activeEvent.id,
  events: eventConfig.events,
  featureFlags: activeEvent.featureFlags,
  activeRoomId: "main-floor",
  currentLive: activeEvent.currentLive,
  rooms: rooms.filter((room) => activeEvent.enabledRoomIds.includes(room.id)),
  schedule: activeEvent.schedule,
  messagesByRoom: initialMessages,
  reactions: [],
  reactionCountsByRoom: {},
  presenceByRoom: {
    "main-floor": { roomId: "main-floor", count: 642, avatars: ["SA", "NK", "ME", "LO", "VE", "JU", "AN"] }
  },
  notifyLeads: [],
  themeMode: "daylight",
  viewerCount: activeEvent.currentLive.viewerCount,
  isPlaying: false,
  isMuted: false,
  volume: 72,
  mobilePanel: "none",
  hydrateLocalSession: () => {
    set({
      hasHydratedSession: true,
      localUser: loadJson<LocalUserSession | null>(sessionStorageKey, null),
      notifyLeads: loadJson<NotifyLead[]>(notifyStorageKey, [])
    });
  },
  hydrateTheme: () => {
    const themeMode = loadJson<ThemeMode>(themeStorageKey, "daylight");
    applyThemeMode(themeMode);
    set({ themeMode });
  },
  enterSession: (nickname, inviteCode) => {
    const cleanNickname = nickname.trim();

    if (!cleanNickname) {
      return;
    }

    const session: LocalUserSession = {
      userId: createId(),
      nickname: cleanNickname,
      inviteCode: inviteCode?.trim() || undefined,
      avatarSeed: createAvatarSeed(cleanNickname)
    };

    persistJson(sessionStorageKey, session);
    set({ localUser: session, hasHydratedSession: true });
  },
  resetIdentity: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(sessionStorageKey);
    }

    set({ localUser: null, hasHydratedSession: true });
  },
  setActiveRoom: (roomId) => {
    const room = get().rooms.find((item) => item.id === roomId);

    set((state) => ({
      activeRoomId: roomId,
      mobilePanel: state.mobilePanel === "rooms" ? "none" : state.mobilePanel,
      presenceByRoom: {
        ...state.presenceByRoom,
        [roomId]: {
          roomId,
          count: room?.count ?? 0,
          avatars: ["SA", "NK", "ME", "LO", "VE", "JU", "AN"]
        }
      }
    }));
  },
  setActiveEvent: (eventId) => {
    const event = get().events.find((item) => item.id === eventId);

    if (!event) {
      return;
    }

    const eventRooms = rooms.filter((room) => event.enabledRoomIds.includes(room.id));
    set({
      activeEventId: event.id,
      featureFlags: event.featureFlags,
      currentLive: event.currentLive,
      rooms: eventRooms,
      schedule: event.schedule,
      activeRoomId: eventRooms[0]?.id ?? "main-floor",
      viewerCount: event.currentLive.viewerCount,
      mobilePanel: "none"
    });
  },
  setLiveStatus: (status) =>
    set((state) => ({
      currentLive: {
        ...state.currentLive,
        status
      }
    })),
  setRoomMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: dedupeMessages(messages).slice(-50)
      }
    })),
  setRoomPresence: (roomId, presence) =>
    set((state) => ({
      presenceByRoom: {
        ...state.presenceByRoom,
        [roomId]: presence
      }
    })),
  setReactionCount: (roomId, count) =>
    set((state) => ({
      reactionCountsByRoom: {
        ...state.reactionCountsByRoom,
        [roomId]: count
      }
    })),
  receiveReaction: (reaction) => {
    if (reaction.roomId !== get().activeRoomId || reaction.userId === get().localUser?.userId) {
      return;
    }

    set((state) => ({
      reactions: [...state.reactions, reaction],
      viewerCount: state.viewerCount + 1
    }));
  },
  sendMessage: (message) => {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    const { activeRoomId, localUser } = get();
    const input = {
      userId: localUser?.userId ?? "local-only",
      nickname: localUser?.nickname ?? "you",
      avatar: localUser?.avatarSeed ?? "YO",
      body: cleanMessage
    };

    void getRealtimeAdapter().sendRoomMessage(activeRoomId, input).catch(() => mockRealtime.sendRoomMessage(activeRoomId, input)).then((newMessage) => {
      set((state) => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [activeRoomId]: dedupeMessages([...(state.messagesByRoom[activeRoomId] ?? []), newMessage]).slice(-50)
        }
      }));
    });
  },
  addReaction: (emoji) => {
    const { activeRoomId, localUser } = get();
    const pulse = {
      id: createId(),
      emoji,
      roomId: activeRoomId,
      userId: localUser?.userId ?? "local-only",
      x: 16 + Math.random() * 68,
      color: "#FF5A7C"
    };

    void getRealtimeAdapter().sendReaction(pulse).catch(() => mockRealtime.sendReaction(pulse));

    set((state) => ({
      reactions: [...state.reactions, pulse],
      viewerCount: state.viewerCount + 1
    }));
  },
  removeReaction: (id) =>
    set((state) => ({
      reactions: state.reactions.filter((reaction) => reaction.id !== id)
    })),
  captureNotifyLead: (lead) => {
    const newLead: NotifyLead = {
      ...lead,
      id: createId(),
      createdAt: new Date().toISOString()
    };

    void getRealtimeAdapter().captureNotifyLead({
      contact: lead.contact,
      eventId: get().activeEventId,
      source: `schedule:${lead.actId}`
    }).catch(() => undefined);

    set((state) => {
      const notifyLeads = [...state.notifyLeads, newLead];
      persistJson(notifyStorageKey, notifyLeads);
      return { notifyLeads };
    });
  },
  clearLocalTestState: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(sessionStorageKey);
      window.localStorage.removeItem(notifyStorageKey);
    }

    set({ localUser: null, notifyLeads: [], hasHydratedSession: true });
  },
  setThemeMode: (themeMode) => {
    persistJson(themeStorageKey, themeMode);
    applyThemeMode(themeMode);
    set({ themeMode });
  },
  toggleThemeMode: () => {
    const nextTheme = get().themeMode === "night" ? "daylight" : "night";
    get().setThemeMode(nextTheme);
  },
  setMobilePanel: (panel) => set({ mobilePanel: panel }),
  togglePlaying: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleMuted: () => set((state) => ({ isMuted: !state.isMuted })),
  setVolume: (volume) => set({ volume })
}));
