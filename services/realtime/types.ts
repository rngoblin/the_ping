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
export type RoomMessageStatusCallback = (status: "loading" | "ready" | "error", error?: string) => void;
export type PresenceCallback = (presence: PresenceState) => void;
export type ReactionCallback = (reaction: ReactionInput) => void;
export type ReactionCountCallback = (count: number) => void;
export type PresenceCountsCallback = (counts: Record<string, number>) => void;

export type RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback, statusCallback?: RoomMessageStatusCallback) => Unsubscribe;
  sendRoomMessage: (roomId: string, message: RoomMessageInput) => Promise<ChatMessage>;
  subscribeToPresence: (roomId: string, callback: PresenceCallback, user?: PresenceUser) => Unsubscribe;
  sendReaction: (reaction: ReactionInput) => Promise<ReactionInput>;
  subscribeToReactions: (callback: ReactionCallback, roomId?: string) => Unsubscribe;
  subscribeToReactionCount: (roomId: string, callback: ReactionCountCallback) => Unsubscribe;
  fetchPresenceCounts: (roomIds: string[]) => Promise<Record<string, number>>;
  captureNotifyLead: (lead: NotifyLeadInput) => Promise<void>;
};
