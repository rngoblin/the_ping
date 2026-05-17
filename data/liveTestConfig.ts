import type { LiveStatus, StreamType } from "@/data/currentLive";
import { schedule } from "@/data/schedule";

export const liveTestConfig = {
  eventId: "field-notes-after-dawn",
  title: "Field Notes After Dawn",
  artist: "Mira Lumen b2b Coastline",
  city: "Tbilisi",
  source: "warehouse room 2",
  streamType: "youtube" as StreamType,
  streamUrl: "",
  embedUrl: "https://www.youtube.com/embed/FzmkttWQNPE?autoplay=1&mute=1&playsinline=1",
  status: "live" as LiveStatus,
  startsAt: "today / 12:15 local",
  feedbackUrl: process.env.NEXT_PUBLIC_FEEDBACK_URL || "https://github.com/rngoblin/the_ping/issues/new",
  schedule
};
