import type { ChatMessage } from "@/data/messages";
import { getSupabaseClient } from "@/services/supabase/client";
import type {
  NotifyLeadInput,
  PresenceCallback,
  PresenceState,
  PresenceUser,
  ReactionCallback,
  ReactionInput,
  RealtimeAdapter,
  RoomMessageCallback,
  RoomMessageInput
} from "@/services/realtime/types";

type MessageRow = {
  id: string;
  room_id: string;
  user_id: string;
  nickname: string;
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

const messageColumns = "id, room_id, user_id, nickname, body, created_at";
const reactionColors = ["#A8FF60", "#8FCB73", "#7FA287", "#5E7A64"];

const initials = (nickname: string) => {
  const clean = nickname.trim().slice(0, 2).toUpperCase();
  return clean || "??";
};

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
  avatar: initials(row.nickname),
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

export const supabaseRealtime: RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      callback([]);
      return () => undefined;
    }

    let isActive = true;
    let messages: ChatMessage[] = [];

    const emit = () => callback(messages);

    void supabase
      .from("messages")
      .select(messageColumns)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!isActive || error) {
          if (error) {
            console.warn("PING Supabase messages fetch failed", error.message);
          }
          return;
        }

        messages = uniqMessages([...(data ?? [])].reverse().map((row) => toChatMessage(row as MessageRow)));
        emit();
      });

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
      .subscribe();

    return () => {
      isActive = false;
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
        body: input.body
      })
      .select(messageColumns)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Message insert failed");
    }

    return toChatMessage(data as MessageRow);
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
