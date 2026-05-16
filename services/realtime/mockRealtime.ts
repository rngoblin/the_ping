import { messagesByRoom } from "@/data/messages";
import type {
  PresenceCallback,
  ReactionCallback,
  ReactionCountCallback,
  ReactionInput,
  RealtimeAdapter,
  RoomMessageCallback,
  RoomMessageStatusCallback,
  RoomMessageInput
} from "@/services/realtime/types";
import type { ChatMessage } from "@/data/messages";

const messageListeners = new Map<string, Set<RoomMessageCallback>>();
const presenceListeners = new Map<string, Set<PresenceCallback>>();
const reactionListeners = new Set<ReactionCallback>();
const reactionCountListeners = new Map<string, Set<ReactionCountCallback>>();
const reactionCounts: Record<string, number> = {};
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
  subscribeToRoomMessages: (roomId, callback, statusCallback?: RoomMessageStatusCallback) => {
    const listeners = messageListeners.get(roomId) ?? new Set<RoomMessageCallback>();
    listeners.add(callback);
    messageListeners.set(roomId, listeners);
    statusCallback?.("loading");
    callback(messageState[roomId] ?? []);
    statusCallback?.("ready");

    return () => {
      listeners.delete(callback);
    };
  },
  sendRoomMessage: async (roomId, input: RoomMessageInput) => {
    const createdAt = new Date().toISOString();
    const newMessage: ChatMessage = {
      id: createId(),
      roomId,
      userId: input.userId,
      username: input.nickname,
      avatar: input.avatar,
      message: input.body,
      timestamp: "now",
      createdAt,
      kind: input.userId.startsWith("system:") ? "system" : "user"
    };

    messageState[roomId] = [...(messageState[roomId] ?? []), newMessage];
    emitMessages(roomId);

    return newMessage;
  },
  subscribeToPresence: (roomId, callback, user) => {
    const listeners = presenceListeners.get(roomId) ?? new Set<PresenceCallback>();
    listeners.add(callback);
    presenceListeners.set(roomId, listeners);
    callback({
      roomId,
      count: user ? 1 : 0,
      avatars: user ? [user.avatar] : [],
      users: user ? [user] : undefined
    });

    return () => {
      listeners.delete(callback);
    };
  },
  sendReaction: async (reaction: ReactionInput) => {
    reactionCounts[reaction.roomId] = (reactionCounts[reaction.roomId] ?? 0) + 1;
    reactionListeners.forEach((callback) => callback(reaction));
    reactionCountListeners.get(reaction.roomId)?.forEach((callback) => callback(reactionCounts[reaction.roomId] ?? 0));
    return reaction;
  },
  subscribeToReactions: (callback: ReactionCallback, roomId?: string) => {
    const scopedCallback = (reaction: ReactionInput) => {
      if (!roomId || reaction.roomId === roomId) {
        callback(reaction);
      }
    };
    reactionListeners.add(scopedCallback);

    return () => {
      reactionListeners.delete(scopedCallback);
    };
  },
  subscribeToReactionCount: (roomId, callback) => {
    const listeners = reactionCountListeners.get(roomId) ?? new Set<ReactionCountCallback>();
    listeners.add(callback);
    reactionCountListeners.set(roomId, listeners);
    callback(reactionCounts[roomId] ?? 0);

    return () => {
      listeners.delete(callback);
    };
  },
  captureNotifyLead: async () => {
    return;
  },
  fetchPresenceCounts: async (roomIds) => Object.fromEntries(roomIds.map((roomId) => [roomId, 0]))
};
