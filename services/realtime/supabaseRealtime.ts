import type { ChatMessage } from "@/data/messages";
import { getSupabaseClient } from "@/services/supabase/client";
import type {
  NotifyLeadInput,
  PresenceCallback,
  PresenceState,
  PresenceUser,
  ReactionCallback,
  ReactionCountCallback,
  ReactionInput,
  RealtimeAdapter,
  RoomMessageCallback,
  RoomMessageInput
} from "@/services/realtime/types";
import { createSigilSeed } from "@/utils/generateSigil";

type MessageRow = {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
  avatar_seed: string | null;
  body: string;
  created_at: string;
};

type ReactionRow = {
  id: string;
  room_id: string;
  user_id: string;
  reaction: string;
  created_at: string;
};

const messageColumns = "id, room_id, user_id, nickname, avatar_seed, body, created_at";
const reactionColors = ["#FF5A7C", "#D96B84", "#8A4F63", "#A8FF60"];

const fallbackAvatarSeed = (nickname: string) => createSigilSeed(nickname, 0);

const relativeTimestamp = (createdAt: string) => {
  const created = new Date(createdAt);
  const ageSeconds = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));

  if (ageSeconds < 60) {
    return "now";
  }

  const ageMinutes = Math.floor(ageSeconds / 60);

  if (ageMinutes < 60) {
    return `${ageMinutes}m`;
  }

  return created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const toChatMessage = (row: MessageRow): ChatMessage => ({
  id: row.id,
  roomId: row.room_id,
  username: row.nickname,
  avatar: row.avatar_seed || fallbackAvatarSeed(row.nickname),
  message: row.body,
  timestamp: relativeTimestamp(row.created_at)
});

const toReaction = (row: ReactionRow): ReactionInput => ({
  id: row.id,
  emoji: row.reaction,
  roomId: row.room_id,
  userId: row.user_id,
  x: 16 + Math.random() * 68,
  color: reactionColors[Math.abs(row.id.charCodeAt(0) + row.reaction.length) % reactionColors.length]
});

const uniqMessages = (messages: ChatMessage[]) => {
  const seen = new Set<string>();

  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
};

const makeEmptyPresence = (roomId: string): PresenceState => ({
  roomId,
  count: 0,
  avatars: [],
  users: []
});

const fetchRoomMessages = async (roomId: string) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("messages")
    .select(messageColumns)
    .eq("room_id", roomId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return [...(data ?? [])].reverse().map((row) => toChatMessage(row as MessageRow));
};

const fetchReactionCount = async (roomId: string) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase.from("reactions").select("id", { count: "exact", head: true }).eq("room_id", roomId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
};

export const supabaseRealtime: RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      callback([]);
      return () => undefined;
    }

    let isActive = true;
    let messages: ChatMessage[] = [];

    const emit = () => callback([...messages]);
    const syncMessages = () => {
      void fetchRoomMessages(roomId)
        .then((nextMessages) => {
          if (!isActive) {
            return;
          }

          messages = uniqMessages(nextMessages);
          emit();
        })
        .catch((error: Error) => {
          console.warn("PING Supabase messages fetch failed", error.message);
        });
    };

    syncMessages();

    const handleReconnect = () => syncMessages();
    window.addEventListener("online", handleReconnect);
    window.addEventListener("focus", handleReconnect);

    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          messages = uniqMessages([...messages, toChatMessage(payload.new as MessageRow)]).slice(-50);
          emit();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          syncMessages();
        }
      });

    return () => {
      isActive = false;
      window.removeEventListener("online", handleReconnect);
      window.removeEventListener("focus", handleReconnect);
      void supabase.removeChannel(channel);
    };
  },

  sendRoomMessage: async (roomId: string, input: RoomMessageInput) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        room_id: roomId,
        user_id: input.userId,
        nickname: input.nickname,
        avatar_seed: input.avatar,
        body: input.body
      })
      .select(messageColumns)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Message insert failed");
    }

    const persistedMessage = {
      ...toChatMessage(data as MessageRow),
      avatar: input.avatar
    };
    return persistedMessage;
  },

  subscribeToPresence: (roomId: string, callback: PresenceCallback, user?: PresenceUser) => {
    const supabase = getSupabaseClient();

    if (!supabase || !user) {
      callback(makeEmptyPresence(roomId));
      return () => undefined;
    }

    callback({
      roomId,
      count: 1,
      avatars: [user.avatar],
      users: [user]
    });

    const channel = supabase.channel(`presence:${roomId}`, {
      config: {
        presence: {
          key: user.userId
        }
      }
    });

    const emitPresence = () => {
      const state = channel.presenceState<PresenceUser>();
      const users = Object.values(state)
        .flat()
        .filter((item) => item.roomId === roomId);

      callback({
        roomId,
        count: users.length,
        avatars: users.map((item) => item.avatar).slice(0, 7),
        users
      });
    };

    channel.on("presence", { event: "sync" }, emitPresence).subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel.track(user);
      }
    });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  },

  sendReaction: async (reaction: ReactionInput) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    const { data, error } = await supabase
      .from("reactions")
      .insert({
        room_id: reaction.roomId,
        user_id: reaction.userId,
        reaction: reaction.emoji
      })
      .select("id, room_id, user_id, reaction, created_at")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Reaction insert failed");
    }

    return toReaction(data as ReactionRow);
  },

  subscribeToReactions: (callback: ReactionCallback) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return () => undefined;
    }

    const channel = supabase
      .channel("reactions")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reactions"
        },
        (payload) => callback(toReaction(payload.new as ReactionRow))
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  },

  subscribeToReactionCount: (roomId: string, callback: ReactionCountCallback) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      callback(0);
      return () => undefined;
    }

    let isActive = true;
    let count = 0;

    const syncCount = () => {
      void fetchReactionCount(roomId)
        .then((nextCount) => {
          if (!isActive) {
            return;
          }

          count = nextCount;
          callback(count);
        })
        .catch((error: Error) => {
          console.warn("PING Supabase reaction count failed", error.message);
        });
    };

    syncCount();

    const handleReconnect = () => syncCount();
    window.addEventListener("online", handleReconnect);
    window.addEventListener("focus", handleReconnect);

    const channel = supabase
      .channel(`reaction-count:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reactions",
          filter: `room_id=eq.${roomId}`
        },
        () => {
          if (!isActive) {
            return;
          }

          count += 1;
          callback(count);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          syncCount();
        }
      });

    return () => {
      isActive = false;
      window.removeEventListener("online", handleReconnect);
      window.removeEventListener("focus", handleReconnect);
      void supabase.removeChannel(channel);
    };
  },

  captureNotifyLead: async (lead: NotifyLeadInput) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    const { error } = await supabase.from("notify_leads").insert({
      contact: lead.contact,
      event_id: lead.eventId,
      source: lead.source ?? "schedule"
    });

    if (error) {
      throw new Error(error.message);
    }
  }
};
