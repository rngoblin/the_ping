export function PingWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="leading-none">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ping-accent">live social signal</div>
      <div className={compact ? "text-xl font-semibold" : "text-3xl font-semibold"}>PING</div>
    </div>
  );
}
