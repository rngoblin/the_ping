import type { LiveStatus, StreamType } from "@/data/currentLive";
import { schedule } from "@/data/schedule";

export const liveTestConfig = {
  eventId: "field-notes-after-dawn",
  title: "Field Notes After Dawn",
  artist: "Mira Lumen b2b Coastline",
  city: "Tbilisi",
  source: "warehouse room 2",
  streamType: "youtube" as StreamType,
  streamUrl: "https://www.youtube.com/watch?v=jP0A9mzR3pM",
  embedUrl: "https://www.youtube.com/embed/jP0A9mzR3pM?autoplay=1&mute=1&loop=1&playlist=jP0A9mzR3pM&playsinline=1&controls=0&rel=0&modestbranding=1",
  status: "live" as LiveStatus,
  startsAt: "tonight / 03:17 local",
  schedule
};
