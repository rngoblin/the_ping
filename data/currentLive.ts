export type LiveStatus = "live" | "startingSoon" | "notLive" | "offline" | "ended";
export type StreamType = "youtube" | "twitch" | "hls" | "placeholder";

export const currentLive = {
  status: "live" as LiveStatus,
  streamType: "youtube" as StreamType,
  streamUrl: "",
  embedUrl: "https://www.youtube.com/embed/FzmkttWQNPE?autoplay=1&mute=0&playsinline=1",
  // Examples for a test night:
  // streamType: "youtube", embedUrl: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
  // streamType: "twitch", embedUrl: "https://player.twitch.tv/?channel=CHANNEL&parent=localhost"
  // streamType: "hls", streamUrl: "https://example.com/live/playlist.m3u8"
  title: "Field Notes After Dawn",
  artist: "Mira Lumen b2b Coastline",
  city: "Tbilisi",
  source: "warehouse room 2",
  startedAt: "03:17",
  elapsedSeconds: 5834,
  startsInMinutes: 18,
  bpm: 132,
  genre: "atmospheric techno",
  mood: "washed pressure / long blends",
  viewerCount: 1842,
  nextTitle: "Slow Signal",
  nextArtist: "Aral Sea Club",
  errorCopy: "signal faded for a moment. the room is still here."
};
