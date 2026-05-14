"use client";

import { Menu, Radio, Settings2 } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import { ThemeSwitch } from "@/components/shell/ThemeSwitch";

export function TopStatus() {
  const viewerCount = usePingStore((state) => state.viewerCount);

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2 rounded-full border border-ping-accent/30 bg-ping-sage/45 px-3 py-1.5 font-mono text-[10px] uppercase text-ping-accent">
          <span className="size-2 rounded-full bg-ping-accent shadow-[0_0_14px_rgba(94,122,100,0.7)]" />
          live
        </span>
        <span className="hidden items-center gap-2 font-mono text-[10px] uppercase text-ping-ink/50 sm:flex">
          <Radio size={13} />
          {viewerCount.toLocaleString()} connected
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitch compact />
        <button className="hidden size-9 place-items-center rounded-full border border-ping-black/10 bg-ping-surface transition hover:bg-ping-muted sm:grid" aria-label="Settings" title="Settings">
          <Settings2 size={16} />
        </button>
        <button className="grid size-9 place-items-center rounded-full border border-ping-black/10 bg-ping-surface transition hover:bg-ping-muted lg:hidden" aria-label="Menu" title="Menu">
          <Menu size={17} />
        </button>
      </div>
    </header>
  );
}
