"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const sendMessage = usePingStore((state) => state.sendMessage);
  const localUser = usePingStore((state) => state.localUser);
  const bannedUserIds = usePingStore((state) => state.bannedUserIds);
  const isBanned = Boolean(localUser && bannedUserIds.includes(localUser.userId));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isBanned) {
      return;
    }

    sendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 flex gap-2 border-t border-ping-black/10 bg-ping-surface/85 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:pb-3">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={isBanned ? "signal muted by host" : "send into the room"}
        disabled={isBanned}
        className="min-w-0 flex-1 rounded-full border border-ping-black/10 bg-ping-bg px-4 py-3 text-sm outline-none transition placeholder:text-ping-ink/35 focus:border-ping-accent/60"
      />
      <button
        type="submit"
        aria-label="Send message"
        title="Send message"
        disabled={isBanned}
        className="pulse-fill grid size-11 shrink-0 place-items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send size={17} />
      </button>
    </form>
  );
}
