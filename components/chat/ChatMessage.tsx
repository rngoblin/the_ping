import type { ChatMessage as ChatMessageType } from "@/data/messages";
import { PixelSigil } from "@/components/identity/PixelSigil";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  return (
    <article className="flex gap-3">
      <div className="grid size-8 shrink-0 place-items-center rounded-md border border-ping-black/10 bg-ping-muted/70 p-1 shadow-line">
        <PixelSigil seed={message.avatar || message.username} className="size-full" title={`${message.username} signal sigil`} />
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
