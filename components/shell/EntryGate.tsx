"use client";

import { FormEvent, useState } from "react";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { usePingStore } from "@/store/usePingStore";
import { ThemeSwitch } from "@/components/shell/ThemeSwitch";

export function EntryGate() {
  const [nickname, setNickname] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const enterSession = usePingStore((state) => state.enterSession);
  const currentLive = usePingStore((state) => state.currentLive);
  const featureFlags = usePingStore((state) => state.featureFlags);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    enterSession(nickname, inviteCode);
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-ping-bg p-5">
      <div className="noise" />
      <div className="venue-atmosphere absolute inset-0 opacity-60">
        <div className="venue-haze" />
        <div className="venue-lines" />
      </div>
      <section className="relative z-10 w-full max-w-md rounded-xl border border-ping-black/10 bg-ping-surface/80 p-5 shadow-mist backdrop-blur-xl">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PingGlyph />
            <PingWordmark compact />
          </div>
          <ThemeSwitch compact />
        </div>

        <h1 className="text-4xl font-semibold leading-none">enter the room</h1>
        <p className="mt-4 text-sm leading-relaxed text-ping-ink/55">
          {currentLive.title} is tuned for one shared stream, a few rooms, and people inside.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/45">nickname</span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="how the room sees you"
              className="h-12 w-full rounded-full border border-ping-black/10 bg-ping-bg px-4 text-sm outline-none transition placeholder:text-ping-ink/35 focus:border-ping-accent/60"
              required
              maxLength={24}
            />
          </label>

          {featureFlags.enableInviteCode ? (
            <label className="block">
              <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/45">invite code</span>
              <input
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value)}
                placeholder="optional"
                className="h-12 w-full rounded-full border border-ping-black/10 bg-ping-bg px-4 text-sm outline-none transition placeholder:text-ping-ink/35 focus:border-ping-accent/60"
              />
            </label>
          ) : null}

          <button className="h-12 w-full rounded-full bg-ping-accent px-5 text-sm font-medium text-ping-bg transition hover:bg-ping-black">
            enter the room
          </button>
        </form>

        <p className="mt-5 font-mono text-[10px] uppercase leading-relaxed text-ping-ink/40">
          local identity only / no account yet
        </p>
      </section>
    </main>
  );
}
