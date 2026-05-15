"use client";

import { FormEvent, useMemo, useState } from "react";
import { PingGlyph } from "@/components/brand/PingGlyph";
import { PingWordmark } from "@/components/brand/PingWordmark";
import { usePingStore } from "@/store/usePingStore";
import { ThemeSwitch } from "@/components/shell/ThemeSwitch";
import { PixelSigil } from "@/components/identity/PixelSigil";
import { createSigilSeed } from "@/utils/generateSigil";
import { isNicknameAllowed, normalizeNickname } from "@/utils/launchGuards";

export function EntryGate() {
  const [nickname, setNickname] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(0);
  const enterSession = usePingStore((state) => state.enterSession);
  const currentLive = usePingStore((state) => state.currentLive);
  const featureFlags = usePingStore((state) => state.featureFlags);
  const sigilOptions = useMemo(() => [0, 1, 2].map((variant) => createSigilSeed(nickname, variant)), [nickname]);
  const cleanNickname = normalizeNickname(nickname);
  const canEnter = isNicknameAllowed(cleanNickname);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canEnter) {
      enterSession(cleanNickname, inviteCode, selectedVariant);
    }
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
            {nickname && !canEnter ? (
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] text-ping-softPink">
                use 2-24 letters, numbers, spaces, dots, dashes, or underscores
              </span>
            ) : null}
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

          <div className="rounded-lg border border-ping-black/10 bg-ping-bg/55 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/45">signal sigil</span>
              <span className="font-mono text-[10px] uppercase text-ping-accent">choose one</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sigilOptions.map((seed, variant) => {
                const isSelected = selectedVariant === variant;

                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`grid h-20 place-items-center rounded-md border transition ${
                      isSelected ? "border-ping-accent bg-ping-sage/55" : "border-ping-black/10 bg-ping-surface hover:border-ping-accent/45"
                    }`}
                    aria-label={`Select signal sigil ${variant + 1}`}
                  >
                    <PixelSigil seed={seed} variant={variant} className="size-12" />
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-md border border-ping-black/10 bg-ping-surface/70 p-2">
              <PixelSigil seed={sigilOptions[selectedVariant]} variant={selectedVariant} className="size-8 shrink-0" />
              <p className="font-mono text-[10px] uppercase leading-relaxed text-ping-ink/45">
                your room signal / saved locally
              </p>
            </div>
          </div>

          <button
            disabled={!canEnter}
            className="h-12 w-full rounded-full bg-ping-accent px-5 text-sm font-medium text-ping-bg transition hover:bg-ping-black disabled:cursor-not-allowed disabled:bg-ping-muted disabled:text-ping-ink/35"
          >
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
