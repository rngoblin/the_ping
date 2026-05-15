"use client";

import { Compass, Disc3, Radio, User, Waves } from "lucide-react";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { NowPlayingCard } from "@/components/live/NowPlayingCard";
import { ThemeSwitch } from "@/components/shell/ThemeSwitch";

const navItems = [
  { label: "live", icon: Radio, targetId: "live-section" },
  { label: "rooms", icon: Waves, targetId: "rooms-section" },
  { label: "schedule", icon: Disc3, action: "schedule" },
  { label: "vibe", icon: Compass, targetId: "vibe-section" },
  { label: "profile", icon: User, disabled: true }
];

export function Sidebar({ onOpenSchedule }: { onOpenSchedule: () => void }) {
  const scrollToSection = (targetId: string) => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="hidden min-h-dvh w-[17rem] shrink-0 border-r border-ping-black/10 bg-ping-surface/65 p-5 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <PingGlyph />
        <PingWordmark />
      </div>

      <nav className="mt-10 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0;

          return (
            <button
              key={item.label}
              onClick={() => {
                if ("action" in item && item.action === "schedule") {
                  onOpenSchedule();
                  return;
                }

                if ("targetId" in item && item.targetId) {
                  scrollToSection(item.targetId);
                }
              }}
              disabled={"disabled" in item && item.disabled}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-ping-sage/70 text-ping-black"
                  : "disabled:cursor-not-allowed disabled:opacity-35 text-ping-ink/55 hover:bg-ping-bg hover:text-ping-ink"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <ThemeSwitch />
        <NowPlayingCard />
        <div className="rounded-lg border border-ping-black/10 bg-ping-bg/45 p-3 font-mono text-[10px] uppercase leading-relaxed text-ping-ink/45">
          one stream, many rooms. new live tomorrow.
        </div>
      </div>
    </aside>
  );
}
