import type { StreamType } from "@/data/currentLive";

const youtubeDefaultParams: Record<string, string> = {
  autoplay: "1",
  mute: "1",
  loop: "1",
  playsinline: "1",
  controls: "0",
  rel: "0",
  modestbranding: "1",
  iv_load_policy: "3",
  disablekb: "1",
  fs: "0",
  enablejsapi: "1"
};

const getYouTubeVideoId = (value: string) => {
  if (!value.trim()) {
    return "";
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname === "music.youtube.com") {
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/").filter(Boolean)[1] ?? "";
      }

      if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/live/")) {
        return url.pathname.split("/").filter(Boolean)[1] ?? "";
      }

      return url.searchParams.get("v") ?? "";
    }
  } catch {
    return value.length >= 8 ? value : "";
  }

  return "";
};

export const createYouTubeEmbedUrl = (source: string, origin?: string) => {
  const videoId = getYouTubeVideoId(source);

  if (!videoId) {
    return source;
  }

  const url = new URL(`https://www.youtube.com/embed/${videoId}`);
  Object.entries(youtubeDefaultParams).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set("playlist", videoId);

  if (origin) {
    url.searchParams.set("origin", origin);
  }

  return url.toString();
};

const createTwitchEmbedUrl = (source: string, origin?: string) => {
  if (!source.trim()) {
    return "";
  }

  try {
    const url = new URL(source);

    if (url.hostname.includes("player.twitch.tv")) {
      if (origin) {
        url.searchParams.set("parent", new URL(origin).hostname);
      }

      return url.toString();
    }

    const channel = url.pathname.split("/").filter(Boolean)[0] ?? "";
    const embedUrl = new URL("https://player.twitch.tv/");
    embedUrl.searchParams.set("channel", channel);

    if (origin) {
      embedUrl.searchParams.set("parent", new URL(origin).hostname);
    }

    return embedUrl.toString();
  } catch {
    const embedUrl = new URL("https://player.twitch.tv/");
    embedUrl.searchParams.set("channel", source.trim());

    if (origin) {
      embedUrl.searchParams.set("parent", new URL(origin).hostname);
    }

    return embedUrl.toString();
  }
};

export const normalizeStreamEmbedUrl = ({
  streamType,
  embedUrl,
  streamUrl,
  origin
}: {
  streamType: StreamType;
  embedUrl?: string;
  streamUrl?: string;
  origin?: string;
}) => {
  const source = (embedUrl || streamUrl || "").trim();

  if (!source) {
    return "";
  }

  if (streamType === "youtube") {
    return createYouTubeEmbedUrl(source, origin);
  }

  if (streamType === "twitch") {
    return createTwitchEmbedUrl(source, origin);
  }

  return source;
};

export const normalizeStreamState = <State extends { streamType?: StreamType; embedUrl?: string; streamUrl?: string }>(state: State, origin?: string): State => {
  if (!state.streamType || state.streamType === "hls" || state.streamType === "placeholder") {
    return state;
  }

  const embedUrl = normalizeStreamEmbedUrl({
    streamType: state.streamType,
    embedUrl: state.embedUrl,
    streamUrl: state.streamUrl,
    origin
  });

  return {
    ...state,
    embedUrl
  };
};
