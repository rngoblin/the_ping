# PING First Live Test

This is the small-room ritual for running the first PING test night.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

For a LAN test, share the network URL printed by Next.js. Everyone should be on the same local network.

## Set The Stream

Edit:

```text
data/currentLive.ts
```

For placeholder mode:

```ts
streamType: "placeholder",
streamUrl: "",
embedUrl: ""
```

For YouTube:

```ts
streamType: "youtube",
embedUrl: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
```

For Twitch:

```ts
streamType: "twitch",
embedUrl: "https://player.twitch.tv/?channel=CHANNEL&parent=localhost"
```

For HLS:

```ts
streamType: "hls",
streamUrl: "https://example.com/live/playlist.m3u8"
```

The placeholder atmosphere remains available when no stream URL is set.

## Invite 5-20 Testers

Send a short note:

```text
PING is open for a small live test tonight.
Enter with any nickname.
Move between rooms, chat lightly, react when it feels right, and check the next transmission.
```

Keep the group small enough that you can watch behavior closely.

## During The Test

Use `Shift + D` to open the host panel.

Check:

- live state: live / startingSoon / notLive / offline
- active event
- current local user
- notify-me captures
- copied test state JSON

Do not explain every feature. Let people find the room.

## Observe

Watch for:

- Do testers understand that the stream stays global while rooms change?
- Do they switch rooms without fear?
- Does chat feel like presence, or does it feel empty?
- Do reactions feel useful or decorative?
- Does the schedule make them want to return?
- Does the entry gate feel light enough?

## Ask After

Use plain questions:

- What did you think was happening in the first 10 seconds?
- Did rooms feel different from each other?
- Where did you want to talk?
- Did you notice the next transmission?
- Would you come back tomorrow if the artist was right?
- What felt too much?
- What felt missing?

## Manual Metrics

Record:

- peak concurrent users
- chat messages per minute
- reactions per minute
- room switches
- notify-me clicks
- average session duration if observable
- qualitative vibe notes

## After The Test

Copy the host panel test state JSON.

Save:

- notify leads
- rough room activity
- comments from testers
- screenshots at mobile and desktop sizes

Do not overbuild from one test. Look for repeated signals.
