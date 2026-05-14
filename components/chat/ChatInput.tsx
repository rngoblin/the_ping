"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";

export function ChatInput() {
  const [message, setMessage] = useState("");
  const sendMessage = usePingStore((state) => state.sendMessage);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 flex gap-2 border-t border-ping-black/10 bg-ping-surface/85 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md lg:pb-3">
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="send into the room"
        className="min-w-0 flex-1 rounded-full border border-ping-black/10 bg-ping-bg px-4 py-3 text-sm outline-none transition placeholder:text-ping-ink/35 focus:border-ping-accent/60"
      />
      <button
        type="submit"
        aria-label="Send message"
        title="Send message"
        className="pulse-fill grid size-11 shrink-0 place-items-center rounded-full transition"
      >
        <Send size={17} />
      </button>
    </form>
  );
}
