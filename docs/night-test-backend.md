# PING Night Test Backend

Goal: 5-20 invited people can enter with a nickname, share one stream, chat in rooms, send pulses, and leave a notify contact.

## 1. Supabase Setup

1. Open the Supabase project.
2. Go to SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Confirm these tables exist:
   - `messages`
   - `reactions`
   - `notify_leads`
5. In Database > Replication, confirm Realtime is enabled for `messages` and `reactions`.

The setup SQL is intentionally non-destructive: it creates missing tables, indexes, RLS policies, and realtime publication entries. It should not delete existing rows.

RLS is intentionally permissive for a closed night test:
- anon can select and insert messages
- anon can select and insert reactions
- anon can insert notify leads
- anon can select notify leads for host export/debug
- no update/delete policies are created

## 2. Local Env

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Use a browser-safe Supabase Publishable key (`sb_publishable_...`). Anything prefixed `NEXT_PUBLIC_` is bundled into the browser. Do not put private secret/service-role keys in this frontend.

The host/debug panel shows whether the deployed app is actually using Supabase or has fallen back to mock realtime.

## 3. Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.

If env vars are missing, PING falls back to mock realtime and still loads.

## 4. Two-Window Test

1. Open PING in two browser windows or two devices.
2. User A enters nickname.
3. User B enters nickname.
4. Both enter `main floor`.
5. User A sends a message.
6. User B should see it without refresh.
7. User B switches to `ambient room`.
8. User B sends a message.
9. User A should not see the ambient message while still in `main floor`.
10. User A sends a pulse.
11. User B should see the floating pulse if in the same active room.
12. Open schedule, click `notify me`, save an email or Telegram handle.
13. Confirm the contact appears in Supabase `notify_leads`.

## 5. Deploy To GitHub Pages

GitHub Pages builds the app statically, so Supabase env vars must exist at build time.

In GitHub repo settings:

1. Settings > Secrets and variables > Actions.
2. Add repository secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. Push to `master`.
4. Watch Actions > Deploy PING to GitHub Pages.
5. Open `https://rngoblin.github.io/the_ping/`.

If secrets are not set, the deployed app will still work, but it will use mock realtime.

The deploy workflow has a guardrail: if the public browser key starts with `sb_secret`, the build fails instead of leaking the key into the static bundle.

For this closed night test, the frontend also has a temporary browser-safe anon fallback config. This is enough for GitHub Pages to connect to Supabase immediately, but persistence still requires `supabase/schema.sql` to be applied in the Supabase SQL editor.

## 6. Configure Tonight

Edit `data/liveTestConfig.ts`:

- `title`
- `artist`
- `city`
- `streamType`
- `streamUrl`
- `embedUrl`
- `status`
- `startsAt`
- `schedule`

For a YouTube test:

```ts
streamType: "youtube",
embedUrl: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1"
```

For placeholder/offline testing:

```ts
streamType: "placeholder",
embedUrl: "",
streamUrl: ""
```

## 7. Observe During Test

Manual metrics:
- peak people inside
- messages per minute
- reactions per minute
- room switches
- notify-me saves
- drop-off points
- confusing moments
- best room names/messages
- whether people understand “next transmission”

## 8. Build Check

Before inviting people:

```bash
npm run lint
npm run build
```

Do not run `npm audit fix --force`.
