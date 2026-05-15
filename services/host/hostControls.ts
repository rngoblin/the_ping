import type { LiveStatus, StreamType } from "@/data/currentLive";
import { getSupabaseClient } from "@/services/supabase/client";
import { normalizeStreamState } from "@/utils/streamSources";

export type HostEventState = {
  status?: LiveStatus;
  streamType?: StreamType;
  streamUrl?: string;
  embedUrl?: string;
  title?: string;
  artist?: string;
  city?: string;
  source?: string;
  genre?: string;
  mood?: string;
  nextTitle?: string;
  nextArtist?: string;
  startsInMinutes?: number;
  updatedAt?: string;
};

export type HostAnnouncement = {
  id: string;
  eventId: string;
  body: string;
  createdAt: string;
};

type HostEventStateCallback = (state: HostEventState | null) => void;
type HostAnnouncementCallback = (announcement: HostAnnouncement | null) => void;

const eventStateStoragePrefix = "ping.hostEventState.v01";
const announcementStoragePrefix = "ping.hostAnnouncement.v01";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getEventStateKey = (eventId: string) => `${eventStateStoragePrefix}:${eventId}`;
const getAnnouncementKey = (eventId: string) => `${announcementStoragePrefix}:${eventId}`;

const readLocalJson = <T,>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
};

const writeLocalJson = (key: string, value: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(key, { detail: value }));
};

const toAnnouncement = (row: { id: string; event_id: string; body: string; created_at: string }): HostAnnouncement => ({
  id: row.id,
  eventId: row.event_id,
  body: row.body,
  createdAt: row.created_at
});

export const subscribeToHostEventState = (eventId: string, callback: HostEventStateCallback) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const key = getEventStateKey(eventId);
    callback(readLocalJson<HostEventState>(key));

    const handleLocalUpdate = (event: Event) => callback((event as CustomEvent<HostEventState>).detail);
    window.addEventListener(key, handleLocalUpdate);
    return () => window.removeEventListener(key, handleLocalUpdate);
  }

  let isActive = true;

  const fetchState = () => {
    void supabase
      .from("event_state")
      .select("payload")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          console.warn("PING host event state fetch failed", error.message);
          return;
        }

        callback((data?.payload as HostEventState | undefined) ?? null);
      });
  };

  fetchState();

  const handleReconnect = () => fetchState();
  window.addEventListener("online", handleReconnect);
  window.addEventListener("focus", handleReconnect);

  const channel = supabase
    .channel(`host-event-state:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "event_state",
        filter: `id=eq.${eventId}`
      },
      (payload) => callback((payload.new as { payload?: HostEventState }).payload ?? null)
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        fetchState();
      }
    });

  return () => {
    isActive = false;
    window.removeEventListener("online", handleReconnect);
    window.removeEventListener("focus", handleReconnect);
    void supabase.removeChannel(channel);
  };
};

export const saveHostEventState = async (eventId: string, state: HostEventState) => {
  const normalizedState = normalizeStreamState(state, typeof window !== "undefined" ? window.location.origin : undefined);
  const payload = {
    ...normalizedState,
    updatedAt: new Date().toISOString()
  };
  const supabase = getSupabaseClient();

  if (!supabase) {
    writeLocalJson(getEventStateKey(eventId), payload);
    return payload;
  }

  const { error } = await supabase.from("event_state").upsert({
    id: eventId,
    payload,
    updated_at: payload.updatedAt
  });

  if (error) {
    throw new Error(error.message);
  }

  return payload;
};

export const subscribeToHostAnnouncement = (eventId: string, callback: HostAnnouncementCallback) => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    const key = getAnnouncementKey(eventId);
    callback(readLocalJson<HostAnnouncement>(key));

    const handleLocalUpdate = (event: Event) => callback((event as CustomEvent<HostAnnouncement>).detail);
    window.addEventListener(key, handleLocalUpdate);
    return () => window.removeEventListener(key, handleLocalUpdate);
  }

  let isActive = true;

  const fetchAnnouncement = () => {
    void supabase
      .from("announcements")
      .select("id, event_id, body, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isActive) {
          return;
        }

        if (error) {
          console.warn("PING announcement fetch failed", error.message);
          return;
        }

        callback(data ? toAnnouncement(data) : null);
      });
  };

  fetchAnnouncement();

  const channel = supabase
    .channel(`host-announcements:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "announcements",
        filter: `event_id=eq.${eventId}`
      },
      (payload) => callback(toAnnouncement(payload.new as { id: string; event_id: string; body: string; created_at: string }))
    )
    .subscribe();

  return () => {
    isActive = false;
    void supabase.removeChannel(channel);
  };
};

export const sendHostAnnouncement = async (eventId: string, body: string) => {
  const cleanBody = body.trim().replace(/\s+/g, " ").slice(0, 280);

  if (!cleanBody) {
    return null;
  }

  const supabase = getSupabaseClient();

  if (!supabase) {
    const announcement: HostAnnouncement = {
      id: createId(),
      eventId,
      body: cleanBody,
      createdAt: new Date().toISOString()
    };
    writeLocalJson(getAnnouncementKey(eventId), announcement);
    return announcement;
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({
      event_id: eventId,
      body: cleanBody
    })
    .select("id, event_id, body, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Announcement insert failed");
  }

  return toAnnouncement(data);
};
