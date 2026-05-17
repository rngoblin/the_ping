import type { ChatMessage } from "@/data/messages";
import { trackRealtimeChannel } from "@/services/performance/perfMetrics";
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
  RoomMessageStatusCallback,
  RoomMessageInput
} from "@/services/realtime/types";
import { debugPing } from "@/utils/debugPing";
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
const REACTION_SENDER_IDLE_MS = 45_000;

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
  userId: row.user_id,
  username: row.nickname,
  avatar: row.avatar_seed || fallbackAvatarSeed(row.nickname),
  message: row.body,
  timestamp: relativeTimestamp(row.created_at),
  createdAt: row.created_at,
  kind: row.user_id.startsWith("system:") ? "system" : "user"
});

const toReaction = (row: ReactionRow): ReactionInput => ({
  id: row.id,
  emoji: row.reaction,
  roomId: row.room_id,
  userId: row.user_id,
  x: 16 + Math.random() * 68,
  color: reactionColors[Math.abs(row.id.charCodeAt(0) + row.reaction.length) % reactionColors.length]
});

const reactionBroadcastChannel = (roomId: string) => `reactions-live:${roomId}`;

type SupabaseChannel = ReturnType<NonNullable<ReturnType<typeof getSupabaseClient>>["channel"]>;

type ReactionBroadcastSender = {
  channel: SupabaseChannel;
  ready: Promise<void>;
  releaseChannel: () => void;
  cleanupTimer: number | null;
};

const reactionBroadcastSenders = new Map<string, ReactionBroadcastSender>();

const disposeReactionBroadcastSender = (roomId: string) => {
  const sender = reactionBroadcastSenders.get(roomId);
  const supabase = getSupabaseClient();

  if (!sender || !supabase) {
    return;
  }

  if (sender.cleanupTimer) {
    window.clearTimeout(sender.cleanupTimer);
  }

  sender.releaseChannel();
  void supabase.removeChannel(sender.channel);
  reactionBroadcastSenders.delete(roomId);
};

const getReactionBroadcastSender = (roomId: string) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const current = reactionBroadcastSenders.get(roomId);

  if (current) {
    if (current.cleanupTimer) {
      window.clearTimeout(current.cleanupTimer);
      current.cleanupTimer = null;
    }

    return current;
  }

  const channel = supabase.channel(reactionBroadcastChannel(roomId));
  const releaseChannel = trackRealtimeChannel();
  const ready = new Promise<void>((resolve) => {
    const timeout = window.setTimeout(resolve, 900);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        window.clearTimeout(timeout);
        resolve();
      }
    });
  });

  const sender: ReactionBroadcastSender = {
    channel,
    ready,
    releaseChannel,
    cleanupTimer: null
  };

  reactionBroadcastSenders.set(roomId, sender);
  return sender;
};

const sendReactionBroadcast = async (reaction: ReactionInput) => {
  const sender = getReactionBroadcastSender(reaction.roomId);

  if (!sender) {
    return;
  }

  await sender.ready;
  await sender.channel.send({
    type: "broadcast",
    event: "reaction",
    payload: reaction
  });

  sender.cleanupTimer = window.setTimeout(() => {
    disposeReactionBroadcastSender(reaction.roomId);
  }, REACTION_SENDER_IDLE_MS);
};

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

const dedupePresenceUsers = (users: PresenceUser[]) => {
  const byUserId = new Map<string, PresenceUser>();

  users.forEach((user) => {
    const current = byUserId.get(user.userId);

    if (!current || new Date(user.joinedAt).getTime() >= new Date(current.joinedAt).getTime()) {
      byUserId.set(user.userId, user);
    }
  });

  return [...byUserId.values()].sort((a, b) => a.nickname.localeCompare(b.nickname));
};

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
    .limit(80);

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

const fetchPresenceSnapshotCounts = async (roomIds: string[]) => {
  const supabase = getSupabaseClient();

  if (!supabase || roomIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase.from("presence_snapshots").select("room_id, count").in("room_id", roomIds);

  if (error) {
    return {};
  }

  return Object.fromEntries((data ?? []).map((row) => [(row as { room_id: string }).room_id, (row as { count: number }).count]));
};

export const supabaseRealtime: RealtimeAdapter = {
  subscribeToRoomMessages: (roomId: string, callback: RoomMessageCallback, statusCallback?: RoomMessageStatusCallback) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      callback([]);
      return () => undefined;
    }

    let isActive = true;
    let messages: ChatMessage[] = [];

    const emit = () => callback([...messages]);
    const syncMessages = () => {
      statusCallback?.("loading");
      debugPing("chat history fetch start", { roomId });
      void fetchRoomMessages(roomId)
        .then((nextMessages) => {
          if (!isActive) {
            return;
          }

          messages = uniqMessages(nextMessages);
          debugPing("chat history fetch success", { roomId, count: messages.length });
          emit();
          statusCallback?.("ready");
        })
        .catch((error: Error) => {
          console.warn("PING Supabase messages fetch failed", error.message);
          debugPing("chat history fetch error", { roomId, error: error.message });
          statusCallback?.("error", error.message);
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
          messages = uniqMessages([...messages, toChatMessage(payload.new as MessageRow)]).slice(-80);
          emit();
        }
      )
      .subscribe((status) => {
        debugPing("message subscription status", { roomId, status });
        if (status === "SUBSCRIBED") {
          syncMessages();
        }
      });
    const releaseChannel = trackRealtimeChannel();

    return () => {
      isActive = false;
      window.removeEventListener("online", handleReconnect);
      window.removeEventListener("focus", handleReconnect);
      releaseChannel();
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

    if (!supabase) {
      callback(makeEmptyPresence(roomId));
      return () => undefined;
    }

    callback(makeEmptyPresence(roomId));

    const channel = user
      ? supabase.channel(`presence:${roomId}`, {
          config: {
            presence: {
              key: user.userId
            }
          }
        })
      : supabase.channel(`presence:${roomId}`);

    const emitPresence = () => {
      const state = channel.presenceState<PresenceUser>();
      const users = dedupePresenceUsers(
        Object.values(state)
        .flat()
          .filter((item) => item.roomId === roomId)
      );

      debugPing("presence sync", { roomId, count: users.length, users: users.map((item) => item.nickname) });
      callback({
        roomId,
        count: users.length,
        avatars: users.map((item) => item.avatar).slice(0, 7),
        users
      });
    };

    channel.on("presence", { event: "sync" }, emitPresence).subscribe((status) => {
      debugPing("presence subscription status", { roomId, status, tracking: Boolean(user) });
      if (status === "SUBSCRIBED") {
        if (user) {
          void channel.track(user);
        } else {
          emitPresence();
        }
      }
    });
    const releaseChannel = trackRealtimeChannel();

    return () => {
      if (user) {
        void channel.untrack();
      }
      releaseChannel();
      void supabase.removeChannel(channel);
    };
  },

  sendReaction: async (reaction: ReactionInput) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      throw new Error("Supabase is not configured");
    }

    void sendReactionBroadcast(reaction);

    const { data, error } = await supabase
      .from("reactions")
      .insert({
        id: reaction.id,
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

  subscribeToReactions: (callback: ReactionCallback, roomId?: string) => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return () => undefined;
    }

    const channelName = roomId ? reactionBroadcastChannel(roomId) : "reactions-live";
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "reaction" }, (payload) => {
        const reaction = payload.payload as ReactionInput;

        if (!roomId || reaction.roomId === roomId) {
          callback(reaction);
        }
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reactions",
          ...(roomId ? { filter: `room_id=eq.${roomId}` } : {})
        },
        (payload) => callback(toReaction(payload.new as ReactionRow))
      )
      .subscribe((status) => {
        debugPing("reaction subscription status", { roomId, status, channelName });
      });
    const releaseChannel = trackRealtimeChannel();

    return () => {
      releaseChannel();
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
        debugPing("reaction count subscription status", { roomId, status });
        if (status === "SUBSCRIBED") {
          syncCount();
        }
      });
    const releaseChannel = trackRealtimeChannel();

    return () => {
      isActive = false;
      window.removeEventListener("online", handleReconnect);
      window.removeEventListener("focus", handleReconnect);
      releaseChannel();
      void supabase.removeChannel(channel);
    };
  },
  fetchPresenceCounts: fetchPresenceSnapshotCounts,

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
