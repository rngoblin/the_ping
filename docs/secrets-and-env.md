# PING Secrets And Environment

PING is currently a static frontend for GitHub Pages.

Use:

```text
.env.local
```

for local values that should not be committed.

Start from:

```bash
cp .env.example .env.local
```

Current supported environment values:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Important:

- `NEXT_PUBLIC_*` values are visible in the browser.
- Use a browser-safe Supabase Publishable key (`sb_publishable_...`).
- Do not place private/secret API keys in this app while it is hosted as static GitHub Pages.
- If PING later needs private APIs, add a backend/API route or serverless proxy and keep private keys there.
- If Supabase env vars are missing, PING falls back to `mockRealtime`.
