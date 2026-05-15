import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { PingGlyph } from "@/components/brand/PingGlyph";

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

type CoverStyle = CSSProperties & Record<`--cover-${string}`, string>;

const accentVars: Record<EventCoverAccent, Pick<CoverStyle, "--cover-accent" | "--cover-accent-soft" | "--cover-interrupt">> = {
  green: {
    "--cover-accent": "#A8FF60",
    "--cover-accent-soft": "rgba(127, 162, 135, 0.55)",
    "--cover-interrupt": "rgba(255, 90, 124, 0.16)"
  },
  pink: {
    "--cover-accent": "#FF5A7C",
    "--cover-accent-soft": "rgba(217, 107, 132, 0.5)",
    "--cover-interrupt": "rgba(168, 255, 96, 0.14)"
  },
  mixed: {
    "--cover-accent": "#A8FF60",
    "--cover-accent-soft": "rgba(127, 162, 135, 0.5)",
    "--cover-interrupt": "rgba(255, 90, 124, 0.28)"
  }
};

const themeVars: Record<EventCoverTheme, Pick<CoverStyle, "--cover-bg" | "--cover-panel" | "--cover-line" | "--cover-text" | "--cover-muted">> = {
  void: {
    "--cover-bg": "#090D0B",
    "--cover-panel": "#111715",
    "--cover-line": "rgba(42, 54, 49, 0.92)",
    "--cover-text": "#E6ECE8",
    "--cover-muted": "#A3B0A7"
  },
  daylight: {
    "--cover-bg": "#F4F4F2",
    "--cover-panel": "#E9E9E6",
    "--cover-line": "rgba(8, 15, 12, 0.14)",
    "--cover-text": "#1A1A1A",
    "--cover-muted": "rgba(26, 26, 26, 0.58)"
  }
};

const normalizeCode = (eventCode: string) => eventCode.trim().toUpperCase() || "PING-000";
const glyphIndexes = [0, 1, 2, 3, 4, 5];

export function EventCover({ title, artist, startsAt, city, genre, eventCode, theme, accent, className = "" }: EventCoverProps) {
  const style = {
    ...themeVars[theme],
    ...accentVars[accent]
  } as CoverStyle;

  return (
    <figure
      className={`event-cover group relative isolate aspect-[var(--cover-ratio,4/5)] min-h-[13rem] overflow-hidden rounded-md border p-3 text-left shadow-line [container-type:inline-size] sm:p-4 ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -z-10 bg-[var(--cover-bg)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.16] mix-blend-screen [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 -z-10 opacity-80 [background:radial-gradient(circle_at_82%_18%,var(--cover-interrupt),transparent_9rem),linear-gradient(120deg,transparent_0_58%,var(--cover-panel)_58%_60%,transparent_60%)]" />
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-60" viewBox="0 0 400 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 116H400M0 244H400M84 0V500M316 0V500" stroke="var(--cover-line)" strokeWidth="1" />
        <path d="M26 386H374" stroke="var(--cover-accent)" strokeWidth="2" strokeDasharray="22 12 3 12" opacity="0.75" />
        <path d="M318 68c26 16 42 38 48 68M318 96c14 10 24 23 29 41" stroke="var(--cover-accent)" strokeWidth="3" fill="none" opacity="0.7" />
      </svg>

      <div className="relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border border-[var(--cover-line)] bg-[color-mix(in_srgb,var(--cover-bg)_84%,transparent)]">
        <header className="grid grid-cols-[auto_1fr] gap-3 border-b border-[var(--cover-line)] p-3">
          <PingGlyph className="size-7 text-[var(--cover-text)] opacity-90" />
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--cover-muted)]">
              <span>PING</span>
              <span className="text-[var(--cover-accent)]">{normalizeCode(eventCode)}</span>
            </div>
            <div className="mt-1 h-1 w-full bg-[var(--cover-line)]">
              <div className="h-full w-2/5 bg-[var(--cover-accent)]" />
            </div>
          </div>
        </header>

        <main className="grid min-h-0 place-items-center overflow-hidden p-3">
          <div className="flex w-full max-w-[19rem] items-center justify-center gap-2 text-[var(--cover-text)] opacity-80">
            {glyphIndexes.map((index) => (
              <PingGlyph
                key={index}
                className={`size-[clamp(1.05rem,7cqw,2rem)] shrink-0 ${index === 2 || index === 3 ? "opacity-95" : "opacity-40"}`}
              />
            ))}
          </div>
        </main>

        <footer className="min-w-0 border-t border-[var(--cover-line)] p-3">
          <div className="grid min-w-0 grid-cols-[1fr_auto] items-start gap-3">
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium leading-tight text-[var(--cover-text)]">{title}</p>
              <p className="mt-1 truncate text-[11px] leading-tight text-[var(--cover-muted)]">{artist}</p>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--cover-text)]">{startsAt}</span>
          </div>
          <div className="mt-2 flex min-w-0 items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--cover-muted)]">
            <MapPin size={11} className="shrink-0 text-[var(--cover-accent)]" />
            <span className="min-w-0 truncate">{city}</span>
            <span className="shrink-0 text-[var(--cover-line)]">/</span>
            <span className="min-w-0 truncate">{genre}</span>
          </div>
        </footer>
      </div>
    </figure>
  );
}
