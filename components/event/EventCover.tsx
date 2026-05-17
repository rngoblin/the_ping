import Image from "next/image";

type EventCoverTheme = "void" | "daylight";
type EventCoverAccent = "green" | "pink" | "mixed";

type EventCoverProps = {
  title: string;
  artist: string;
  startsAt: string;
  city: string;
  genre: string;
  eventCode: string;
  theme: EventCoverTheme;
  accent: EventCoverAccent;
  className?: string;
};

const normalizeCode = (eventCode: string) => eventCode.trim().toUpperCase() || "PING-000";
const UPCOMING_COVER_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ping-upcoming-event-cover.png`;

export function EventCover({ title, artist, startsAt, city, genre, eventCode, className = "" }: EventCoverProps) {
  const coverLabel = `${title} by ${artist}. ${genre} in ${city}, scheduled ${startsAt}. ${normalizeCode(eventCode)}.`;

  return (
    <figure
      className={`event-cover group relative isolate aspect-[var(--cover-ratio,16/9)] overflow-hidden rounded-md border border-ping-black/10 bg-ping-black text-left shadow-line ${className}`}
      aria-label={coverLabel}
    >
      <Image src={UPCOMING_COVER_SRC} alt="" fill sizes="(min-width: 1280px) 22rem, (min-width: 640px) 14rem, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.015]" />
    </figure>
  );
}
