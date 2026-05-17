export type PingTestEventStatus = "upcoming" | "live" | "ended";

export const tomorrowTestEvent = {
  id: "ping-room-test-2026-05-17",
  title: "PING room test",
  description: "A small closed session to check radio, chat, presence, reactions, and feedback with friends inside one shared room.",
  startsAt: "2026-05-17T16:00:00.000Z",
  endsAt: "2026-05-17T18:00:00.000Z",
  roomId: "main-floor",
  roomLabel: "main floor",
  isPublished: true
};

export const getTestEventStatus = (now = new Date()): PingTestEventStatus => {
  const startsAt = new Date(tomorrowTestEvent.startsAt).getTime();
  const endsAt = new Date(tomorrowTestEvent.endsAt).getTime();
  const time = now.getTime();

  if (time >= startsAt && time <= endsAt) {
    return "live";
  }

  if (time > endsAt) {
    return "ended";
  }

  return "upcoming";
};

export const formatTestEventTime = () =>
  new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(tomorrowTestEvent.startsAt));
