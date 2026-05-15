import { getSupabaseClient } from "@/services/supabase/client";

export type ModerationActionType = "hide_message" | "ban_user";

export type ModerationAction = {
  id: string;
  eventId: string;
  roomId: string;
  action: ModerationActionType;
  targetUserId: string;
  targetNickname?: string;
  targetMessageId?: string;
  createdAt: string;
};

export type ModerationActionInput = {
  eventId: string;
  roomId: string;
  action: ModerationActionType;
  targetUserId: string;
  targetNickname?: string;
  targetMessageId?: string;
};

const localModerationKey = "ping.moderationActions.v01";

type ModerationActionRow = {
  id: string;
  event_id: string;
  room_id: string;
  action: ModerationActionType;
  target_user_id: string;
  target_nickname: string | null;
  target_message_id: string | null;
  created_at: string;
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toModerationAction = (row: ModerationActionRow): ModerationAction => ({
  id: row.id,
  eventId: row.event_id,
  roomId: row.room_id,
  action: row.action,
  targetUserId: row.target_user_id,
  targetNickname: row.target_nickname ?? undefined,
  targetMessageId: row.target_message_id ?? undefined,
  createdAt: row.created_at
});

const loadLocalActions = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.localStorage.getItem(localModerationKey) ?? "[]") as ModerationAction[];
  } catch {
    return [];
  }
};

const saveLocalActions = (actions: ModerationAction[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localModerationKey, JSON.stringify(actions));
};

export const subscribeToModerationActions = (eventId: string, callback: (actions: ModerationAction[]) => void) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    callback(loadLocalActions().filter((action) => action.eventId === eventId));
    return () => undefined;
  }

  let isActive = true;
  let actions: ModerationAction[] = [];
  const emit = () => callback([...actions]);

  const syncActions = () => {
    void supabase
      .from("moderation_actions")
      .select("id, event_id, room_id, action, target_user_id, target_nickname, target_message_id, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true })
      .limit(500)
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          console.warn("PING moderation fetch failed", error.message);
          return;
        }

        actions = (data ?? []).map((row) => toModerationAction(row as ModerationActionRow));
        emit();
      });
  };

  syncActions();

  const channel = supabase
    .channel(`moderation:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "moderation_actions",
        filter: `event_id=eq.${eventId}`
      },
      (payload) => {
        const action = toModerationAction(payload.new as ModerationActionRow);
        actions = actions.some((item) => item.id === action.id) ? actions : [...actions, action];
        emit();
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        syncActions();
      }
    });

  return () => {
    isActive = false;
    void supabase.removeChannel(channel);
  };
};

export const createModerationAction = async (input: ModerationActionInput) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const action: ModerationAction = {
      id: createId(),
      eventId: input.eventId,
      roomId: input.roomId,
      action: input.action,
      targetUserId: input.targetUserId,
      targetNickname: input.targetNickname,
      targetMessageId: input.targetMessageId,
      createdAt: new Date().toISOString()
    };
    saveLocalActions([...loadLocalActions(), action]);
    return action;
  }

  const { data, error } = await supabase
    .from("moderation_actions")
    .insert({
      event_id: input.eventId,
      room_id: input.roomId,
      action: input.action,
      target_user_id: input.targetUserId,
      target_nickname: input.targetNickname,
      target_message_id: input.targetMessageId
    })
    .select("id, event_id, room_id, action, target_user_id, target_nickname, target_message_id, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Moderation action failed");
  }

  return toModerationAction(data as ModerationActionRow);
};
