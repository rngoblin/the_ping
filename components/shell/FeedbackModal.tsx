"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { submitFeedback } from "@/services/feedback";
import { usePingStore } from "@/store/usePingStore";

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const localUser = usePingStore((state) => state.localUser);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const username = useMemo(() => localUser?.nickname ?? "anonymous", [localUser?.nickname]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  const submit = () => {
    setStatus("sending");
    setError("");

    void submitFeedback({
      username,
      roomId: activeRoomId,
      message,
      userSessionId: localUser?.userId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined
    })
      .then(() => {
        setMessage("");
        setStatus("success");
      })
      .catch((nextError: Error) => {
        setError(nextError.message);
        setStatus("error");
      });
  };

  return (
    <div className="fixed inset-0 z-[72] grid place-items-end bg-ping-black/35 p-3 backdrop-blur-sm sm:place-items-center">
      <section className="w-full max-w-lg rounded-xl border border-ping-black/10 bg-ping-surface p-4 text-ping-ink shadow-mist">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-accent">feedback signal</p>
            <h2 className="mt-2 text-xl font-semibold">leave feedback</h2>
          </div>
          <button onClick={onClose} aria-label="Close feedback" className="grid size-9 place-items-center rounded-full border border-ping-black/10">
            <X size={16} />
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase text-ping-ink/45">username</span>
          <input value={username} readOnly className="h-10 w-full rounded-md border border-ping-black/10 bg-ping-bg px-3 text-sm text-ping-ink" />
        </label>

        <label className="mt-3 block">
          <span className="mb-1 block font-mono text-[10px] uppercase text-ping-ink/45">message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={8000}
            placeholder="what worked, what felt strange, what should be tuned..."
            className="soft-scroll min-h-44 w-full resize-none rounded-md border border-ping-black/10 bg-ping-bg p-3 text-sm leading-relaxed text-ping-ink outline-none placeholder:text-ping-ink/35"
          />
        </label>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-ping-ink/45">{message.length.toLocaleString()} / 8000</p>
          <button
            onClick={submit}
            disabled={!message.trim() || status === "sending"}
            className="flex items-center gap-2 rounded-full border border-ping-pink/35 bg-ping-pink px-4 py-2 text-sm font-medium text-white transition hover:bg-ping-softPink disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Send size={14} />
            {status === "sending" ? "sending" : "submit"}
          </button>
        </div>

        {status === "success" ? (
          <p className="mt-3 rounded-md border border-ping-accent/25 bg-ping-accent/10 p-3 text-sm text-ping-accent">feedback received.</p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 rounded-md border border-ping-softPink/30 bg-ping-softPink/10 p-3 text-sm text-ping-softPink">
            {error || "feedback failed"}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export function FeedbackButton({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`feedback-button flex w-full items-center justify-center gap-2 rounded-md border border-ping-pink/35 bg-ping-surface/92 px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ping-pink shadow-line transition hover:border-ping-pink hover:bg-ping-softPink/15 ${className}`}
    >
      <MessageSquare size={13} />
      leave feedback
    </button>
  );
}
