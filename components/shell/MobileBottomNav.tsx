"use client";

import { CalendarDays, Radio, Users, Waves } from "lucide-react";
import { usePingStore, type MobilePanel } from "@/store/usePingStore";

const items: { id: MobilePanel | "live"; label: string; icon: typeof Radio }[] = [
  { id: "live", label: "Live", icon: Radio },
  { id: "rooms", label: "Rooms", icon: Waves },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "vibe", label: "Heat", icon: Users }
];

export function MobileBottomNav() {
  const mobilePanel = usePingStore((state) => state.mobilePanel);
  const setMobilePanel = usePingStore((state) => state.setMobilePanel);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ping-black/10 bg-ping-bg/90 px-3 pb-[calc(0.45rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === "live" ? mobilePanel === "none" : mobilePanel === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === "live") {
                  setMobilePanel("none");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  return;
                }

                setMobilePanel(mobilePanel === item.id ? "none" : item.id);
              }}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md font-mono text-[10px] uppercase transition ${
                isActive ? "bg-ping-sage/70 text-ping-black" : "text-ping-ink/50"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
