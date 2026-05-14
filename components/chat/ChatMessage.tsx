import type { ChatMessage as ChatMessageType } from "@/data/messages";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <article className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-full border border-ping-black/10 bg-ping-muted font-mono text-[10px] text-ping-ink/60">
        {message.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="text-sm font-medium">{message.username}</span>
          <span className="font-mono text-[10px] uppercase text-ping-ink/35">{message.timestamp}</span>
        </div>
        <p className="text-sm leading-relaxed text-ping-ink/75">{message.message}</p>
      </div>
    </article>
  );
}
