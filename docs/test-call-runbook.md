# PING Test Call Runbook

Goal: run a 5-30 person test where people enter with a nickname, watch/listen to one shared stream, move between rooms, chat, react, and leave feedback.

## Pre-Test Checklist

- Deploy the latest `master` to GitHub Pages.
- Open `https://rngoblin.github.io/the_ping/` on desktop and mobile.
- Confirm GitHub Actions has:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - optional `NEXT_PUBLIC_FEEDBACK_URL`
- In Supabase SQL Editor, run `supabase/schema.sql`.
- Enable Realtime for:
  - `messages`
  - `reactions`
  - `event_state`
  - `announcements`
  - `moderation_actions`
- Open PING on two devices with different nicknames.
- Send a message in `main floor`; refresh both devices; confirm it persists.
- Send reactions from both devices; confirm pulses appear and the counter updates.
- Save a notify contact; confirm it appears in `notify_leads`.
- Paste the final stream URL in the host panel and press `save live state`.
- Test the stream on:
  - iOS Safari
  - Android Chrome
  - desktop Chrome/Firefox/Safari if available

## Host Script

30 minutes before:
- Open host panel from the top settings button or the `host` pill.
- Set state to `startingSoon`.
- Save title, artist, city, source, stream type, and stream URL.
- Send announcement: `signal opens soon / keep this tab nearby`.

5 minutes before:
- Confirm the DJ stream is live at the source.
- Press play in PING on one desktop and one phone.
- Send announcement if delayed.

Start:
- Set state to `live`.
- Save live state.
- Ask testers to enter one room and send one message.

During:
- Watch chat persistence and reaction sync.
- Use announcements for delays, source changes, or ending notes.
- Use moderation only when needed: select an online user, hide their latest message, or mute their local identity for the test.
- Keep a manual note of bugs with device/browser.

End:
- Set state to `ended`.
- Send announcement with feedback request.
- Export notify leads or copy test state from host panel.

## Tester Instructions

- Open the shared GitHub Pages URL.
- Enter a nickname and choose a signal sigil.
- Press play on the stream.
- Send one message in `main floor`.
- Switch to another room and send one room-specific message.
- Send a few reactions.
- Open schedule and try `notify me`.
- Use `leave feedback` before closing.

## Known Issues To Watch

- Mobile browsers may require a tap before audio starts.
- YouTube/Twitch embed behavior can vary by browser and stream permissions.
- Host panel is intentionally lightweight and not protected by real auth yet.
- Presence counts are approximate during reconnects.
- If Supabase env vars are missing on GitHub Pages, the app falls back to mock realtime.

## Post-Test Questions

- Did the app feel like a live room rather than a website?
- Could you tell someone was live within 5 seconds?
- Was chat easy to find and use?
- Did room switching make sense?
- Did reactions feel visible without being distracting?
- Did you understand when the next live happens?
- What confused you?
- What made you want to stay?
- Would you come back for another live?

## Manual Metrics

- Peak concurrent users.
- Messages per minute.
- Reactions per minute.
- Room switches.
- Notify-me saves.
- Feedback submissions.
- Stream start failures.
- Mobile keyboard/input issues.
- Average session length if observable.
- Best qualitative quote.
