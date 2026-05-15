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
# Legacy alternative:
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_FEEDBACK_URL=
```

Important:

- `NEXT_PUBLIC_*` values are visible in the browser.
- Use a browser-safe Supabase Publishable key (`sb_publishable_...`) when available.
- Legacy anon keys are also browser-safe, but publishable keys are preferred for new deploys.
- Do not place private/secret API keys in this app while it is hosted as static GitHub Pages.
- The GitHub Pages workflow refuses to build if the browser key starts with `sb_secret`.
- The frontend does not include hardcoded Supabase fallback keys. Configure deploy env vars before a real test night.
- If PING later needs private APIs, add a backend/API route or serverless proxy and keep private keys there.
- If Supabase env vars are missing, PING falls back to `mockRealtime`.
- `NEXT_PUBLIC_FEEDBACK_URL` is optional. If it is missing, the test build falls back to the GitHub issue form.
