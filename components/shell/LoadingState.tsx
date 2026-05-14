import { PingGlyph } from "@/components/brand/PingGlyph";

export function LoadingState() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ping-bg">
      <div className="flex flex-col items-center gap-4">
        <PingGlyph className="animate-pulse" />
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ping-ink/45">tuning the room...</p>
      </div>
    </div>
  );
}
