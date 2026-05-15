"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { usePingStore } from "@/store/usePingStore";

export function ChatPanel() {
  const rooms = usePingStore((state) => state.rooms);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const messages = usePingStore((state) => state.messagesByRoom[activeRoomId] ?? []);
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
    <motion.section
      key={activeRoomId}
      initial={{ opacity: 0.88 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22 }}
      className="chat-panel flex h-[58dvh] min-h-[21rem] flex-col overflow-hidden rounded-lg border border-ping-black/10 bg-ping-surface/80 shadow-line sm:h-[62dvh] sm:min-h-[24rem] lg:h-[34rem] lg:min-h-0 xl:h-[calc(100dvh-19rem)] xl:max-h-[42rem]"
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

      <div ref={scrollRef} className="soft-scroll min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <ChatInput />
    </motion.section>
  );
}
