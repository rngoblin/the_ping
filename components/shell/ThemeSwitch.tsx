"use client";

import { Moon, Sun } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const themeMode = usePingStore((state) => state.themeMode);
  const toggleThemeMode = usePingStore((state) => state.toggleThemeMode);
  const isNight = themeMode === "night";

  return (
    <button
      onClick={toggleThemeMode}
      aria-label={isNight ? "Switch to daylight version" : "Switch to night version"}
      title={isNight ? "Daylight version" : "Night version"}
      className={`flex items-center gap-2 rounded-full border border-ping-black/10 bg-ping-surface text-ping-ink transition hover:bg-ping-muted ${
        compact ? "h-9 px-3" : "h-10 px-3"
      }`}
    >
      {isNight ? <Sun size={16} /> : <Moon size={16} />}
      <span className="font-mono text-[10px] uppercase">{isNight ? "day" : "night"}</span>
    </button>
  );
}
