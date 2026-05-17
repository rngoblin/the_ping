"use client";

import { useEffect, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@/data/messages";
import { usePingStore } from "@/store/usePingStore";

const emptyMessages: ChatMessageType[] = [];

export function ChatPanel() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const hiddenMessageIds = usePingStore((state) => state.hiddenMessageIds);
  const roomMessages = usePingStore((state) => state.messagesByRoom[activeRoomId] ?? emptyMessages);
  const chatStatus = usePingStore((state) => state.chatStatusByRoom[activeRoomId]?.status ?? "idle");
  const chatError = usePingStore((state) => state.chatStatusByRoom[activeRoomId]?.error);
  const messages = useMemo(
    () => roomMessages.filter((message) => !hiddenMessageIds.includes(message.id)).slice(-80),
    [hiddenMessageIds, roomMessages]
  );
  const activeRoom = rooms.find((room) => room.id === activeRoomId);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollNode = scrollRef.current;

    if (!scrollNode) {
      return;
    }

    scrollNode.scrollTop = scrollNode.scrollHeight;
  }, [activeRoomId, messages.length]);

  return (
    <section
      className="chat-panel flex h-[58dvh] min-h-[21rem] flex-col overflow-hidden rounded-lg border border-ping-black/10 bg-ping-surface/80 shadow-line sm:h-[62dvh] sm:min-h-[24rem] lg:h-[44.75rem] lg:min-h-0 xl:h-[44.75rem] xl:max-h-[44.75rem]"
      style={activeRoom ? ({ "--active-room-tint": activeRoom.tint } as CSSProperties) : undefined}
    >
      <div className="flex items-start justify-between gap-3 border-b border-ping-black/10 px-4 py-3">
        <div>
          <h2 className="text-lg font-medium">{activeRoom?.name}</h2>
          <p className="text-xs text-ping-ink/50">{activeRoom?.tagline}</p>
          <p className="mt-2 font-mono text-[10px] uppercase text-ping-ink/40">{activeRoom?.mood}</p>
        </div>
        <span className="rounded-full bg-ping-bg px-3 py-1 font-mono text-[10px] uppercase text-ping-accent">
          {messages.length} signals
        </span>
      </div>

      <div ref={scrollRef} className="soft-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {chatStatus === "loading" && !messages.length ? (
          <div className="grid min-h-full place-items-center py-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-ink/40">loading chat history...</p>
          </div>
        ) : chatStatus === "error" && !messages.length ? (
          <div className="grid min-h-full place-items-center py-10 text-center">
            <div className="max-w-xs">
              <div className="mx-auto mb-4 h-px w-24 bg-ping-softPink/45" />
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-softPink">failed to load chat history.</p>
              <p className="mt-3 text-sm leading-relaxed text-ping-ink/45">{chatError ?? "try refreshing the room."}</p>
            </div>
          </div>
        ) : messages.length ? (
          messages.map((message) => <ChatMessage key={message.id} message={message} />)
        ) : (
          <div className="grid min-h-full place-items-center py-10 text-center">
            <div className="max-w-xs">
              <div className="mx-auto mb-4 h-px w-24 bg-ping-accent/35" />
              <p className="text-sm font-medium text-ping-ink/55">No messages yet. Send the first signal.</p>
              <p className="mt-3 text-sm leading-relaxed text-ping-ink/45">
                {activeRoom?.name ?? "this room"} is quiet for now. Drop a pulse when the room starts to breathe.
              </p>
            </div>
          </div>
        )}
      </div>

      <ChatInput />
    </section>
  );
}
