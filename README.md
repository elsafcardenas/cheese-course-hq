# The Cheese Course HQ

One place to run The Cheese Course's content and operations for Miami (Weston and Pinecrest) and Spain: the calendar, tasks, platforms, KPIs, the plan, decisions, a content toolkit, the asset library, and live connections to Square, Instagram and Facebook, Google Business Profile and TikTok.

It replaces the Notion workspace as the day-to-day tool. Notion keeps the long write-ups; the Plan tab links to them.

## Tabs

| Tab | What it's for |
| --- | --- |
| **Today** | Clocks for Madrid, Miami and Mexico City; what's due this week; next posts; decisions waiting on Ricardo; open work by workstream; Miami pillar mix vs target. |
| **Calendar** | Month view (drag a post to another day), board by status (drag to move it along), list view, a "For Ricardo" filter, and the Spain post bank. |
| **Tasks** | List, board and by-owner views; filters; inline status changes; edit drawer. |
| **Platforms** | Every Miami and Spain account in opening order, with status and a tickable setup checklist. |
| **KPIs** | Baselines and 3/6-month targets, a monthly log with charts, the video log (median views, engagement), sales by store, Google Business numbers, and the Square menu-engineering matrix. |
| **Plan** | The two tracks, the Balanced timeline as a Gantt, pillars, the weekly Elsa ↔ Luis workflow, links to Notion. |
| **Decisions** | Decisions by status; Ricardo can answer the ones waiting on him; meeting log. |
| **Toolkit** | Hook library, caption builder, shoot-list generator, brief for Luis, time-zone helper, hashtag sets. |
| **Assets** | Drive folders and links; store managers upload footage. |
| **Integrations** | Connect, sync and check each data source. |
| **Team** | Invite people and set their role. |

## Who can do what

| Role | For | Can |
| --- | --- | --- |
| Admin | Elsa | Everything, including integrations and the team. |
| Editor | Luis | Edit posts, tasks, assets and the video log. |
| Viewer | Ricardo | See everything; comment on posts; answer decisions. |
| Store manager | Weston, Pinecrest | See their store's tasks and posts; update their tasks; upload footage. |

Roles are enforced twice: in the app, and in the database with row level security, so nobody can read or write more than their role allows even outside the app. Integration tokens are only readable by the server.

---

## Run it on your computer (demo mode)

Needs [Node.js 20+](https://nodejs.org).

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no database configured the app runs in **demo mode** on a copy of the Notion data (52 tasks, 25 posts, 20 platforms, 15 decisions, KPIs, sales). Changes are kept until the server restarts. Use **Preview as** at the bottom of the sidebar to see what Luis, Ricardo or a store manager sees.

## Put it online (about 30 minutes, free tiers)

You can put it online in demo mode first: deploy on Vercel with just `SITE_PASSWORD` set, and the whole site asks for that password. Add Supabase afterwards to get real logins and saved changes; once Supabase is set, the password prompt is replaced by the sign-in page.

### 1. Supabase (database, sign-in, file storage)

1. Create a project at [supabase.com](https://supabase.com) (region: US East is closest to Miami).
2. **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_init.sql`, and run it.
3. **Authentication → Sign In / Providers**: keep Email on; turn **off** "Allow new users to sign up" (only people you invite can get in).
4. **Authentication → URL Configuration**: set Site URL to your app's address (from step 2) and add `https://YOUR-APP.vercel.app/auth/callback` to Redirect URLs.
5. **Project Settings → API**: copy the Project URL, the `anon` key and the `service_role` key.
6. Load the Notion data: create `.env.local` from `.env.example`, fill in the three Supabase values, and run `npm run seed`.
7. Create your own login: **Authentication → Users → Invite user** with your email. The first person in the database becomes admin. Then invite everyone else from the app's Team tab.

### 2. Vercel (hosting)

1. Push this repo to GitHub (private).
2. At [vercel.com](https://vercel.com) → Add New Project → import the repo.
3. Environment variables: everything in `.env.example`. Set `NEXT_PUBLIC_APP_URL` to the Vercel address, and `CRON_SECRET` to a long random string.
4. Deploy. `vercel.json` schedules the nightly sync (`/api/cron/sync`, 10:00 UTC, before the Miami stores open).

## Connect the data sources

Each one is built; it needs a developer app and two keys. The Integrations tab shows each step and the exact redirect URL to register.

| Source | Keys | Fills in | Approval |
| --- | --- | --- | --- |
| **Square** | `SQUARE_APP_ID`, `SQUARE_APP_SECRET` | Daily net sales and orders per store; 12 months of item sales for the menu engineering | None (your own account). First sync backfills 12 months and may take two runs. |
| **Meta** (Instagram + Facebook) | `META_APP_ID`, `META_APP_SECRET` | Followers, every Reel's views, likes, comments, saves, shares; reach, profile views, link clicks | Development mode is enough for your own accounts. Instagram must be a Business account linked to the page. The login lasts about 60 days; the app warns 10 days before. |
| **Google Business Profile** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Calls, directions, website clicks, rating, reviews per store | Google must approve API access for your Cloud project first. Apply early. |
| **TikTok** | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | Followers, video views, likes, comments, shares | TikTok reviews the app before it works outside the sandbox. |

All connections are read-only. Tokens are stored in the database where only the server can read them, and refreshed automatically (except Meta, which has no refresh: press Reconnect when the warning appears).

## Project layout

```
app/(hq)/          the tabs (each folder is one tab)
app/actions.ts     every change goes through these server actions, with role checks
app/api/           OAuth connect/callback per provider, nightly cron
lib/integrations/  Square, Meta, Google and TikTok clients and sync jobs
lib/repo/          data access: Supabase in production, in-memory in demo mode
data/seed.ts       the Notion data
data/plan.ts       timeline, pillars, workflow
data/toolkit.ts    hooks, shot library, hashtags, brief presets
supabase/          database schema, roles and security rules
```

## Adding to it later

- **A new tab**: add a folder under `app/(hq)/`, add it to `NAV` in `components/Sidebar.tsx` and to `NAV_FOR_ROLE` in `lib/auth.ts`.
- **A new data source**: add a provider in `lib/integrations/` (authorize URL, token exchange, sync) and register it in `registry.ts` and `index.ts`.
- **Paid ads** (parked for now): the Meta connection can add `ads_read` to pull spend, reach and cost per result into the same KPI views.
