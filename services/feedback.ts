import { getSupabaseClient } from "@/services/supabase/client";

export type FeedbackInput = {
  username: string;
  roomId?: string;
  message: string;
  userSessionId?: string;
  userAgent?: string;
};

export type FeedbackItem = FeedbackInput & {
  id: string;
  createdAt: string;
};

type FeedbackRow = {
  id: string;
  username: string | null;
  room_id: string | null;
  message: string;
  user_session_id: string | null;
  user_agent: string | null;
  created_at: string;
};

const localFeedbackKey = "ping.feedback.v01";
const feedbackColumns = "id, username, room_id, message, user_session_id, user_agent, created_at";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const readLocalFeedback = (): FeedbackItem[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(localFeedbackKey);
    return stored ? (JSON.parse(stored) as FeedbackItem[]) : [];
  } catch {
    return [];
  }
};

const writeLocalFeedback = (items: FeedbackItem[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localFeedbackKey, JSON.stringify(items));
};

const toFeedbackItem = (row: FeedbackRow): FeedbackItem => ({
  id: row.id,
  username: row.username ?? "anonymous",
  roomId: row.room_id ?? undefined,
  message: row.message,
  userSessionId: row.user_session_id ?? undefined,
  userAgent: row.user_agent ?? undefined,
  createdAt: row.created_at
});

export const submitFeedback = async (input: FeedbackInput) => {
  const message = input.message.trim();

  if (!message || message.length > 8000) {
    throw new Error("Feedback must be between 1 and 8000 characters.");
  }

  const payload = {
    username: input.username.trim().slice(0, 80) || "anonymous",
    room_id: input.roomId ?? null,
    message,
    user_session_id: input.userSessionId ?? null,
    user_agent: input.userAgent?.slice(0, 500) ?? null
  };
  const supabase = getSupabaseClient();

  if (!supabase) {
    const item: FeedbackItem = {
      id: createId(),
      username: payload.username,
      roomId: payload.room_id ?? undefined,
      message: payload.message,
      userSessionId: payload.user_session_id ?? undefined,
      userAgent: payload.user_agent ?? undefined,
      createdAt: new Date().toISOString()
    };
    const nextItems = [item, ...readLocalFeedback()].slice(0, 100);
    writeLocalFeedback(nextItems);
    return item;
  }

  const { data, error } = await supabase.from("feedback").insert(payload).select(feedbackColumns).single();

  if (error || !data) {
    throw new Error(error?.message ?? "Feedback insert failed");
  }

  return toFeedbackItem(data as FeedbackRow);
};

export const fetchFeedback = async () => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return readLocalFeedback();
  }

  const { data, error } = await supabase.from("feedback").select(feedbackColumns).order("created_at", { ascending: false }).limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => toFeedbackItem(row as FeedbackRow));
};
