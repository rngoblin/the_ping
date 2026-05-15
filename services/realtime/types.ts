import type { ChatMessage } from "@/data/messages";
import type { ReactionPulse } from "@/store/usePingStore";

export type RoomMessageInput = {
  userId: string;
  nickname: string;
  avatar: string;
  body: string;
};

export type PresenceUser = {
  userId: string;
  nickname: string;
  avatar: string;
  roomId: string;
  joinedAt: string;
};

export type PresenceState = {
  roomId: string;
  count: number;
  avatars: string[];
  users?: PresenceUser[];
};

export type ReactionInput = ReactionPulse & {
  roomId: string;
  userId: string;
};

export type NotifyLeadInput = {
  contact: string;
  eventId?: string;
  source?: string;
};

export type Unsubscribe = () => void;

export type RoomMessageCallback = (messages: ChatMessage[]) => void;
export type PresenceCallback = (presence: PresenceState) => void;
export type ReactionCallback = (reaction: ReactionInput) => void;
export type ReactionCountCallback = (count: number) => void;

export type RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback) => Unsubscribe;
  sendRoomMessage: (roomId: string, message: RoomMessageInput) => Promise<ChatMessage>;
  subscribeToPresence: (roomId: string, callback: PresenceCallback, user?: PresenceUser) => Unsubscribe;
  sendReaction: (reaction: ReactionInput) => Promise<ReactionInput>;
  subscribeToReactions: (callback: ReactionCallback) => Unsubscribe;
  subscribeToReactionCount: (roomId: string, callback: ReactionCountCallback) => Unsubscribe;
  captureNotifyLead: (lead: NotifyLeadInput) => Promise<void>;
};
