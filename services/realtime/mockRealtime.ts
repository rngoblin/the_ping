import { messagesByRoom } from "@/data/messages";
import { rooms } from "@/data/rooms";
import type {
  PresenceCallback,
  ReactionCallback,
  ReactionCountCallback,
  ReactionInput,
  RealtimeAdapter,
  RoomMessageCallback,
  RoomMessageInput
} from "@/services/realtime/types";
import type { ChatMessage } from "@/data/messages";
import { createSigilSeed } from "@/utils/generateSigil";

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
    const createdAt = new Date().toISOString();
    const newMessage: ChatMessage = {
      id: createId(),
      roomId,
      userId: input.userId,
      username: input.nickname,
      avatar: input.avatar,
      message: input.body,
      timestamp: "now",
      createdAt
    };

    messageState[roomId] = [...(messageState[roomId] ?? []), newMessage];
    emitMessages(roomId);

    return newMessage;
  },
  subscribeToPresence: (roomId, callback, user) => {
    const listeners = presenceListeners.get(roomId) ?? new Set<PresenceCallback>();
    const room = rooms.find((item) => item.id === roomId);
    const fallbackAvatars = [
      createSigilSeed("salma", 0),
      createSigilSeed("niko", 1),
      createSigilSeed("mei", 2),
      createSigilSeed("lo", 0),
      createSigilSeed("ve", 1),
      createSigilSeed("june", 2),
      createSigilSeed("anna", 0)
    ];
    const avatars = user ? [user.avatar, ...fallbackAvatars.filter((avatar) => avatar !== user.avatar)].slice(0, 7) : fallbackAvatars;
    listeners.add(callback);
    presenceListeners.set(roomId, listeners);
    callback({
      roomId,
      count: room?.count ?? 0,
      avatars,
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
  subscribeToReactions: (callback: ReactionCallback) => {
    reactionListeners.add(callback);

    return () => {
      reactionListeners.delete(callback);
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
  }
};
