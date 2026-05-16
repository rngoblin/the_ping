"use client";

import { useEffect, useMemo, useState } from "react";
import { PixelSigil } from "@/components/identity/PixelSigil";
import type { PresenceState, PresenceUser } from "@/services/realtime/types";

const pluralizePeople = (count: number) => `${count.toLocaleString()} ${count === 1 ? "person" : "people"} inside this room right now.`;

const dedupeUsers = (users: PresenceUser[] = []) => {
  const byUserId = new Map<string, PresenceUser>();

  users.forEach((user) => {
    const previous = byUserId.get(user.userId);

    if (!previous || new Date(user.joinedAt).getTime() >= new Date(previous.joinedAt).getTime()) {
      byUserId.set(user.userId, user);
    }
  });

  return [...byUserId.values()].sort((a, b) => a.nickname.localeCompare(b.nickname));
};

export function PeopleHere({ presence }: { presence?: PresenceState }) {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const users = useMemo(() => dedupeUsers(presence?.users), [presence?.users]);
  const count = presence?.count ?? users.length;

  useEffect(() => {
    if (!activeUserId) {
      return;
    }

    const timeout = window.setTimeout(() => setActiveUserId(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [activeUserId]);

  return (
    <section className="rounded-lg border border-ping-black/10 bg-ping-surface/80 p-4 shadow-line">
      <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/50">people here</h2>
      <div className="flex flex-wrap gap-2">
        {users.length ? (
          users.map((user) => {
            const isActive = activeUserId === user.userId;

            return (
              <button
                key={user.userId}
                type="button"
                onClick={() => setActiveUserId(user.userId)}
                onMouseEnter={() => setActiveUserId(user.userId)}
                onMouseLeave={() => setActiveUserId(null)}
                className="group relative grid size-9 place-items-center rounded-md border-2 border-ping-surface bg-ping-muted/75 p-1 shadow-line"
                aria-label={`${user.nickname} is inside`}
                title={user.nickname}
              >
                <PixelSigil seed={user.avatar || user.nickname} className="size-full" title={`${user.nickname} signal sigil`} />
                <span
                  className={`pointer-events-none absolute bottom-[calc(100%+0.45rem)] left-1/2 z-50 max-w-[12rem] -translate-x-1/2 whitespace-nowrap rounded-md border border-ping-black/10 bg-ping-bg px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ping-ink shadow-line transition ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {user.nickname}
                </span>
              </button>
            );
          })
        ) : (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ping-ink/35">no visible signals yet</p>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ping-ink/55">{pluralizePeople(count)}</p>
    </section>
  );
}
