import { currentLive } from "@/data/currentLive";
import { liveTestConfig } from "@/data/liveTestConfig";
import { rooms } from "@/data/rooms";
import { schedule } from "@/data/schedule";

export type ThemeVariant = "daylight-afterhours";
export type RealtimeProvider = "mock" | "supabase";

export type FeatureFlags = {
  enableEntryGate: boolean;
  enableInviteCode: boolean;
  enableMockRealtime: boolean;
  enableScheduleNotify: boolean;
  enableDebugPanel: boolean;
};

export type PingEvent = {
  id: string;
  name: string;
  subtitle: string;
  dateLabel: string;
  feedbackUrl?: string;
  themeVariant: ThemeVariant;
  currentLive: typeof currentLive;
  enabledRoomIds: string[];
  schedule: typeof schedule;
  featureFlags: FeatureFlags;
};

export const featureFlags: FeatureFlags = {
  enableEntryGate: true,
  enableInviteCode: true,
  enableMockRealtime: true,
  enableScheduleNotify: true,
  enableDebugPanel: true
};

export const testEvents: PingEvent[] = [
  {
    id: "field-notes-after-dawn",
    name: "Field Notes After Dawn",
    subtitle: "one shared stream from a quiet room after sunrise",
    dateLabel: "test night / this week",
    feedbackUrl: liveTestConfig.feedbackUrl,
    themeVariant: "daylight-afterhours",
    currentLive: {
      ...currentLive,
      status: liveTestConfig.status,
      streamType: liveTestConfig.streamType,
      streamUrl: liveTestConfig.streamUrl,
      embedUrl: liveTestConfig.embedUrl,
      title: liveTestConfig.title,
      artist: liveTestConfig.artist,
      city: liveTestConfig.city,
      source: liveTestConfig.source
    },
    enabledRoomIds: rooms.map((room) => room.id),
    schedule: liveTestConfig.schedule,
    featureFlags
  },
  {
    id: "slow-signal-preview",
    name: "Slow Signal Preview",
    subtitle: "a softer room for testing starting soon state",
    dateLabel: "tomorrow 02:00",
    feedbackUrl: liveTestConfig.feedbackUrl,
    themeVariant: "daylight-afterhours",
    currentLive: {
      ...currentLive,
      status: "startingSoon",
      title: "Slow Signal",
      artist: "Aral Sea Club",
      nextTitle: "Slow Signal",
      nextArtist: "Aral Sea Club",
      city: "Helsinki",
      source: "basement radio room",
      genre: "dub techno",
      mood: "wide, patient, frost-lit",
      streamType: "placeholder",
      streamUrl: "",
      embedUrl: ""
    },
    enabledRoomIds: ["main-floor", "ambient", "smoking-area", "visuals-art"],
    schedule,
    featureFlags
  }
];

export const eventConfig = {
  currentEventId: "field-notes-after-dawn",
  realtimeProvider: "supabase" as RealtimeProvider,
  events: testEvents,
  supabase: {
    // Browser realtime only. If these are missing, PING falls back to mockRealtime.
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  }
};
