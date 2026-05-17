import { getTestEventStatus, type PingTestEventStatus } from "@/data/testEvent";

export type SessionState = "scheduled" | "live" | "ended" | "archived";

export const getSessionState = (now = new Date()): SessionState => {
  const eventStatus: PingTestEventStatus = getTestEventStatus(now);

  if (eventStatus === "upcoming") {
    return "scheduled";
  }

  if (eventStatus === "live") {
    return "live";
  }

  return "ended";
};

export const sessionStateCopy: Record<
  SessionState,
  {
    header: string;
    playerBadge: string;
    detail: string;
  }
> = {
  scheduled: {
    header: "room open",
    playerBadge: "scheduled",
    detail: "broadcast starts at 21:00"
  },
  live: {
    header: "live",
    playerBadge: "on air",
    detail: "room is open"
  },
  ended: {
    header: "ended",
    playerBadge: "replay",
    detail: "signal has settled"
  },
  archived: {
    header: "archived",
    playerBadge: "archive",
    detail: "room memory"
  }
};
