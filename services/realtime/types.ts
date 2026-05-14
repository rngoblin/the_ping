import type { ChatMessage } from "@/data/messages";
import type { ReactionPulse } from "@/store/usePingStore";

export type RoomMessageInput = {
  username: string;
  avatar: string;
  message: string;
};

export type PresenceState = {
  roomId: string;
  count: number;
  avatars: string[];
};

export type Unsubscribe = () => void;

export type RoomMessageCallback = (messages: ChatMessage[]) => void;
export type PresenceCallback = (presence: PresenceState) => void;
export type ReactionCallback = (reaction: ReactionPulse) => void;

export type RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback) => Unsubscribe;
  sendRoomMessage: (roomId: string, message: RoomMessageInput) => Promise<ChatMessage>;
  subscribeToPresence: (roomId: string, callback: PresenceCallback) => Unsubscribe;
  sendReaction: (reaction: ReactionPulse) => Promise<ReactionPulse>;
  subscribeToReactions: (callback: ReactionCallback) => Unsubscribe;
};
