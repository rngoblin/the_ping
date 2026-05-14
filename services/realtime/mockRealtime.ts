import { messagesByRoom } from "@/data/messages";
import { rooms } from "@/data/rooms";
import type {
  PresenceCallback,
  ReactionCallback,
  RealtimeAdapter,
  RoomMessageCallback,
  RoomMessageInput
} from "@/services/realtime/types";
import type { ChatMessage } from "@/data/messages";
import type { ReactionPulse } from "@/store/usePingStore";

const messageListeners = new Map<string, Set<RoomMessageCallback>>();
const presenceListeners = new Map<string, Set<PresenceCallback>>();
const reactionListeners = new Set<ReactionCallback>();
const messageState: Record<string, ChatMessage[]> = structuredClone(messagesByRoom);

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const emitMessages = (roomId: string) => {
  messageListeners.get(roomId)?.forEach((callback) => callback(messageState[roomId] ?? []));
};

export const mockRealtime: RealtimeAdapter = {
  subscribeToRoomMessages: (roomId, callback) => {
    const listeners = messageListeners.get(roomId) ?? new Set<RoomMessageCallback>();
    listeners.add(callback);
    messageListeners.set(roomId, listeners);
    callback(messageState[roomId] ?? []);

    return () => {
      listeners.delete(callback);
    };
  },
  sendRoomMessage: async (roomId, input: RoomMessageInput) => {
    const newMessage: ChatMessage = {
      id: createId(),
      roomId,
      username: input.username,
      avatar: input.avatar,
      message: input.message,
      timestamp: "now"
    };

    messageState[roomId] = [...(messageState[roomId] ?? []), newMessage];
    emitMessages(roomId);

    return newMessage;
  },
  subscribeToPresence: (roomId, callback) => {
    const listeners = presenceListeners.get(roomId) ?? new Set<PresenceCallback>();
    const room = rooms.find((item) => item.id === roomId);
    listeners.add(callback);
    presenceListeners.set(roomId, listeners);
    callback({
      roomId,
      count: room?.count ?? 0,
      avatars: ["SA", "NK", "ME", "LO", "VE", "JU", "AN"]
    });

    return () => {
      listeners.delete(callback);
    };
  },
  sendReaction: async (reaction: ReactionPulse) => {
    reactionListeners.forEach((callback) => callback(reaction));
    return reaction;
  },
  subscribeToReactions: (callback: ReactionCallback) => {
    reactionListeners.add(callback);

    return () => {
      reactionListeners.delete(callback);
    };
  }
};
