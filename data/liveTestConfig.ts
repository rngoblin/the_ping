import type { LiveStatus, StreamType } from "@/data/currentLive";
import { schedule } from "@/data/schedule";

export const liveTestConfig = {
  eventId: "field-notes-after-dawn",
  title: "Field Notes After Dawn",
  artist: "Mira Lumen b2b Coastline",
  city: "Tbilisi",
  source: "warehouse room 2",
  streamType: "placeholder" as StreamType,
  streamUrl: "",
  embedUrl: "",
  status: "notLive" as LiveStatus,
  startsAt: "tonight / 03:17 local",
  feedbackUrl: process.env.NEXT_PUBLIC_FEEDBACK_URL || "https://github.com/rngoblin/the_ping/issues/new",
  schedule
};
