"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Copy, EyeOff, Trash2, X } from "lucide-react";
import { usePingStore } from "@/store/usePingStore";
import type { LiveStatus, StreamType } from "@/data/currentLive";
import { getRealtimeProviderName } from "@/services/realtime";
import { getSupabaseRuntimeStatus } from "@/services/supabase/client";
import { saveHostEventState, sendHostAnnouncement, type HostEventState } from "@/services/host/hostControls";
import { createModerationAction } from "@/services/host/moderation";
import { fetchFeedback, type FeedbackItem } from "@/services/feedback";

export function DebugPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const events = usePingStore((state) => state.events);
  const activeEventId = usePingStore((state) => state.activeEventId);
  const currentLive = usePingStore((state) => state.currentLive);
  const activeAnnouncement = usePingStore((state) => state.activeAnnouncement);
  const localUser = usePingStore((state) => state.localUser);
  const notifyLeads = usePingStore((state) => state.notifyLeads);
  const activeRoomId = usePingStore((state) => state.activeRoomId);
  const presenceByRoom = usePingStore((state) => state.presenceByRoom);
  const messagesByRoom = usePingStore((state) => state.messagesByRoom);
  const hiddenMessageIds = usePingStore((state) => state.hiddenMessageIds);
  const bannedUserIds = usePingStore((state) => state.bannedUserIds);
  const moderationActions = usePingStore((state) => state.moderationActions);
  const applyModerationAction = usePingStore((state) => state.applyModerationAction);
  const viewerCount = usePingStore((state) => state.viewerCount);
  const setActiveEvent = usePingStore((state) => state.setActiveEvent);
  const setLiveStatus = usePingStore((state) => state.setLiveStatus);
  const setCurrentLivePatch = usePingStore((state) => state.setCurrentLivePatch);
  const clearLocalTestState = usePingStore((state) => state.clearLocalTestState);
  const resetIdentity = usePingStore((state) => state.resetIdentity);
  const supabaseStatus = getSupabaseRuntimeStatus();
  const [hostState, setHostState] = useState<HostEventState>({});
  const [announcementBody, setAnnouncementBody] = useState("");
  const [hostSaveLabel, setHostSaveLabel] = useState("save live state");
  const [announcementLabel, setAnnouncementLabel] = useState("send announcement");
  const [selectedModerationUserId, setSelectedModerationUserId] = useState("");
  const [moderationLabel, setModerationLabel] = useState("");
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackLabel, setFeedbackLabel] = useState("");

  const currentHostState = useMemo<HostEventState>(
    () => ({
      status: currentLive.status,
      streamType: currentLive.streamType,
      streamUrl: currentLive.streamUrl,
      embedUrl: currentLive.embedUrl,
      title: currentLive.title,
      artist: currentLive.artist,
      city: currentLive.city,
      source: currentLive.source,
      genre: currentLive.genre,
      mood: currentLive.mood,
      nextTitle: currentLive.nextTitle,
      nextArtist: currentLive.nextArtist,
      startsInMinutes: currentLive.startsInMinutes
    }),
    [currentLive]
  );

  const activePresence = presenceByRoom[activeRoomId];
  const onlineUsers = useMemo(() => {
    const users = activePresence?.users ?? [];
    const fallback = localUser ? [{ userId: localUser.userId, nickname: localUser.nickname, avatar: localUser.avatarSeed, roomId: activeRoomId, joinedAt: localUser.enteredAt ?? "" }] : [];
    const byId = new Map([...users, ...fallback].map((user) => [user.userId, user]));
    return [...byId.values()];
  }, [activePresence?.users, activeRoomId, localUser]);
  const selectedUser = onlineUsers.find((user) => user.userId === selectedModerationUserId);
  const activeRoomMessages = messagesByRoom[activeRoomId] ?? [];
  const latestSelectedUserMessage = selectedUser
    ? [...activeRoomMessages]
        .reverse()
        .find((message) => message.userId === selectedUser.userId && message.kind !== "system" && !hiddenMessageIds.includes(message.id))
    : undefined;

  useEffect(() => {
    if (isOpen) {
      setHostState(currentHostState);
    }
  }, [currentHostState, isOpen]);

  useEffect(() => {
    if (!selectedModerationUserId && onlineUsers[0]) {
      setSelectedModerationUserId(onlineUsers[0].userId);
    }
  }, [onlineUsers, selectedModerationUserId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFeedbackLabel("loading...");
    void fetchFeedback()
      .then((items) => {
        setFeedbackItems(items);
        setFeedbackLabel("");
      })
      .catch((error: Error) => {
        setFeedbackLabel(error.message);
      });
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const testState = {
    activeEventId,
    realtimeProvider: getRealtimeProviderName(),
    liveStatus: currentLive.status,
    streamType: currentLive.streamType,
    activeRoomId,
    viewerCount,
    localUser,
    notifyLeads
  };

  const updateHostField = <Key extends keyof HostEventState>(key: Key, value: HostEventState[Key]) => {
    setHostState((state) => ({ ...state, [key]: value }));
  };

  const saveLiveState = () => {
    setHostSaveLabel("saving...");
    void saveHostEventState(activeEventId, hostState)
      .then((savedState) => {
        setCurrentLivePatch(savedState);
        if (savedState.status) {
          setLiveStatus(savedState.status);
        }
        setHostSaveLabel("saved");
        window.setTimeout(() => setHostSaveLabel("save live state"), 1200);
      })
      .catch((error: Error) => {
        console.warn("PING host state save failed", error.message);
        setHostSaveLabel("save failed");
        window.setTimeout(() => setHostSaveLabel("save live state"), 1600);
      });
  };

  const sendAnnouncement = () => {
    setAnnouncementLabel("sending...");
    void sendHostAnnouncement(activeEventId, announcementBody)
      .then((announcement) => {
        if (announcement) {
          setAnnouncementBody("");
        }
        setAnnouncementLabel("sent");
        window.setTimeout(() => setAnnouncementLabel("send announcement"), 1200);
      })
      .catch((error: Error) => {
        console.warn("PING announcement send failed", error.message);
        setAnnouncementLabel("send failed");
        window.setTimeout(() => setAnnouncementLabel("send announcement"), 1600);
      });
  };

  const runModerationAction = (mode: "hide_message" | "ban_user") => {
    if (!selectedUser) {
      return;
    }

    if (mode === "hide_message" && !latestSelectedUserMessage) {
      setModerationLabel("no visible message");
      window.setTimeout(() => setModerationLabel(""), 1400);
      return;
    }

    setModerationLabel(mode === "hide_message" ? "hiding..." : "banning...");
    void createModerationAction({
      eventId: activeEventId,
      roomId: activeRoomId,
      action: mode,
      targetUserId: selectedUser.userId,
      targetNickname: selectedUser.nickname,
      targetMessageId: mode === "hide_message" ? latestSelectedUserMessage?.id : undefined
    })
      .then((action) => {
        applyModerationAction(action);
        setModerationLabel(mode === "hide_message" ? "message hidden" : "user banned");
        window.setTimeout(() => setModerationLabel(""), 1400);
      })
      .catch((error: Error) => {
        console.warn("PING moderation action failed", error.message);
        setModerationLabel("moderation failed");
        window.setTimeout(() => setModerationLabel(""), 1600);
      });
  };

  const copyState = () => {
    void navigator.clipboard?.writeText(JSON.stringify(testState, null, 2));
  };

  return (
    <aside className="fixed bottom-4 right-4 z-[70] max-h-[80dvh] w-[min(92vw,28rem)] overflow-hidden rounded-xl border border-ping-black/15 bg-ping-black text-ping-bg shadow-mist">
      <div className="flex items-center justify-between border-b border-ping-bg/10 p-4">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ping-bg/65">host panel</h2>
          <p className="mt-1 text-sm text-ping-bg/45">Shift + D</p>
        </div>
        <button onClick={onClose} aria-label="Close host panel" className="grid size-9 place-items-center rounded-full border border-ping-bg/15">
          <X size={16} />
        </button>
      </div>

      <div className="soft-scroll max-h-[calc(80dvh-4.5rem)] space-y-5 overflow-y-auto p-4">
        <section>
          <label className="mb-2 block font-mono text-[10px] uppercase text-ping-bg/45">event</label>
          <select
            value={activeEventId}
            onChange={(event) => setActiveEvent(event.target.value)}
            className="h-10 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id} className="text-ping-black">
                {event.name}
              </option>
            ))}
          </select>
        </section>

        <section>
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">live state</p>
          <div className="grid grid-cols-2 gap-2">
            {(["live", "startingSoon", "notLive", "offline", "ended"] satisfies LiveStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setLiveStatus(status);
                  updateHostField("status", status);
                }}
                className={`rounded-full border px-3 py-2 text-sm ${
                  currentLive.status === status ? "border-ping-sage bg-ping-sage text-ping-black" : "border-ping-bg/15 bg-ping-bg/10 text-ping-bg"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-3 font-mono text-[10px] uppercase text-ping-bg/45">live control</p>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">title</span>
              <input value={hostState.title ?? ""} onChange={(event) => updateHostField("title", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">artist</span>
                <input value={hostState.artist ?? ""} onChange={(event) => updateHostField("artist", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">city</span>
                <input value={hostState.city ?? ""} onChange={(event) => updateHostField("city", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">description / source</span>
              <input value={hostState.source ?? ""} onChange={(event) => updateHostField("source", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
            </label>
            <div className="grid grid-cols-[8rem_1fr] gap-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">stream</span>
                <select
                  value={hostState.streamType ?? "placeholder"}
                  onChange={(event) => updateHostField("streamType", event.target.value as StreamType)}
                  className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-2 text-sm text-ping-bg"
                >
                  {(["youtube", "twitch", "hls", "placeholder"] satisfies StreamType[]).map((streamType) => (
                    <option key={streamType} value={streamType} className="text-ping-black">
                      {streamType}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">embed url</span>
                <input value={hostState.embedUrl ?? ""} onChange={(event) => updateHostField("embedUrl", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">stream url / hls</span>
              <input value={hostState.streamUrl ?? ""} onChange={(event) => updateHostField("streamUrl", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
            </label>
            <div className="grid grid-cols-[1fr_1fr_5rem] gap-2">
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">next title</span>
                <input value={hostState.nextTitle ?? ""} onChange={(event) => updateHostField("nextTitle", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">next artist</span>
                <input value={hostState.nextArtist ?? ""} onChange={(event) => updateHostField("nextArtist", event.target.value)} className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg" />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">mins</span>
                <input
                  type="number"
                  min={0}
                  value={hostState.startsInMinutes ?? 0}
                  onChange={(event) => updateHostField("startsInMinutes", Number(event.target.value))}
                  className="h-9 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-2 text-sm text-ping-bg"
                />
              </label>
            </div>
            <button onClick={saveLiveState} className="w-full rounded-full border border-ping-sage bg-ping-sage px-3 py-2 text-sm text-ping-black">
              {hostSaveLabel}
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">announcement</p>
          {activeAnnouncement ? <p className="mb-3 rounded-md bg-ping-bg/10 p-2 text-xs leading-relaxed text-ping-bg/60">{activeAnnouncement.body}</p> : null}
          <textarea
            value={announcementBody}
            onChange={(event) => setAnnouncementBody(event.target.value)}
            maxLength={280}
            placeholder="visible to everyone inside"
            className="min-h-20 w-full resize-none rounded-md border border-ping-bg/15 bg-ping-bg/10 p-3 text-sm text-ping-bg outline-none placeholder:text-ping-bg/30"
          />
          <button onClick={sendAnnouncement} className="mt-2 w-full rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            {announcementLabel}
          </button>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase text-ping-bg/45">moderation</p>
            <span className="font-mono text-[10px] uppercase text-ping-bg/35">{activeRoomId}</span>
          </div>
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase text-ping-bg/40">online user</span>
            <select
              value={selectedModerationUserId}
              onChange={(event) => setSelectedModerationUserId(event.target.value)}
              className="h-10 w-full rounded-md border border-ping-bg/15 bg-ping-bg/10 px-3 text-sm text-ping-bg"
            >
              {onlineUsers.length ? (
                onlineUsers.map((user) => (
                  <option key={user.userId} value={user.userId} className="text-ping-black">
                    {user.nickname} {bannedUserIds.includes(user.userId) ? "/ banned" : ""}
                  </option>
                ))
              ) : (
                <option value="" className="text-ping-black">
                  no online users
                </option>
              )}
            </select>
          </label>
          <div className="mt-3 rounded-md border border-ping-bg/10 bg-ping-bg/5 p-2">
            <p className="font-mono text-[10px] uppercase text-ping-bg/35">latest visible message</p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-ping-bg/65">
              {latestSelectedUserMessage ? latestSelectedUserMessage.message : "no message from selected user in this room"}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => runModerationAction("hide_message")}
              disabled={!selectedUser || !latestSelectedUserMessage}
              className="flex items-center justify-center gap-2 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <EyeOff size={14} />
              delete
            </button>
            <button
              onClick={() => runModerationAction("ban_user")}
              disabled={!selectedUser || Boolean(selectedUser && bannedUserIds.includes(selectedUser.userId))}
              className="flex items-center justify-center gap-2 rounded-full border border-ping-softPink/35 px-3 py-2 text-sm text-ping-softPink disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Ban size={14} />
              ban
            </button>
          </div>
          <p className="mt-2 min-h-4 font-mono text-[10px] uppercase text-ping-bg/40">{moderationLabel}</p>
          <p className="mt-2 text-xs leading-relaxed text-ping-bg/35">
            Test-safe moderation: delete hides one message everywhere; ban blocks future chat and reactions for that local identity.
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase text-ping-bg/35">
            {moderationActions.length} moderation actions
          </p>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">realtime</p>
          <p className="font-mono text-xs uppercase text-ping-bg/70">{getRealtimeProviderName()}</p>
          <p className="mt-2 text-xs leading-relaxed text-ping-bg/45">
            Supabase {supabaseStatus.configured ? "configured" : "not configured"} / URL {supabaseStatus.hasUrl ? "yes" : "missing"} / key{" "}
            {supabaseStatus.hasPublishableKey ? "yes" : "missing"}
          </p>
          {supabaseStatus.hasLegacyAnonKey ? (
            <p className="mt-2 text-xs leading-relaxed text-ping-bg/45">Using legacy anon key env. Publishable key env is preferred for new deploys.</p>
          ) : null}
          {supabaseStatus.keyLooksSecret ? (
            <p className="mt-2 text-xs leading-relaxed text-ping-softPink">Secret key detected. Browser realtime is disabled until a publishable key is used.</p>
          ) : null}
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">local user</p>
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-ping-bg/70">{JSON.stringify(localUser, null, 2)}</pre>
          <button onClick={resetIdentity} className="mt-3 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            reset identity
          </button>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase text-ping-bg/45">notify leads</p>
          <pre className="max-h-36 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-ping-bg/70">{JSON.stringify(notifyLeads, null, 2)}</pre>
        </section>

        <section className="rounded-lg border border-ping-bg/10 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] uppercase text-ping-bg/45">feedback</p>
            <button
              onClick={() => {
                setFeedbackLabel("loading...");
                void fetchFeedback()
                  .then((items) => {
                    setFeedbackItems(items);
                    setFeedbackLabel("");
                  })
                  .catch((error: Error) => setFeedbackLabel(error.message));
              }}
              className="rounded-full border border-ping-bg/15 px-2 py-1 font-mono text-[9px] uppercase text-ping-bg/65"
            >
              refresh
            </button>
          </div>
          {feedbackLabel ? <p className="mb-2 text-xs text-ping-bg/45">{feedbackLabel}</p> : null}
          <div className="soft-scroll max-h-56 space-y-2 overflow-y-auto">
            {feedbackItems.length ? (
              feedbackItems.map((item) => (
                <article key={item.id} className="rounded-md border border-ping-bg/10 bg-ping-bg/5 p-2">
                  <div className="flex items-center justify-between gap-3 font-mono text-[9px] uppercase text-ping-bg/35">
                    <span>{item.username}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-ping-bg/70">{item.message}</p>
                </article>
              ))
            ) : (
              <p className="text-xs text-ping-bg/35">no feedback yet</p>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button onClick={copyState} className="flex items-center gap-2 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            <Copy size={14} />
            copy test state
          </button>
          <button onClick={clearLocalTestState} className="flex items-center gap-2 rounded-full border border-ping-bg/15 px-3 py-2 text-sm text-ping-bg/80">
            <Trash2 size={14} />
            clear local data
          </button>
        </div>
      </div>
    </aside>
  );
}
