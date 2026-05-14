import { currentLive } from "@/data/currentLive";
import { rooms } from "@/data/rooms";
import { schedule } from "@/data/schedule";

export type ThemeVariant = "daylight-afterhours";

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
    themeVariant: "daylight-afterhours",
    currentLive,
    enabledRoomIds: rooms.map((room) => room.id),
    schedule,
    featureFlags
  },
  {
    id: "slow-signal-preview",
    name: "Slow Signal Preview",
    subtitle: "a softer room for testing starting soon state",
    dateLabel: "tomorrow 02:00",
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
  events: testEvents,
  supabase: {
    // Supabase realtime will attach here later. Keep mockRealtime as the default provider for V0.3.
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  }
};
