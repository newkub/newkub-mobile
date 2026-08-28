---
name: newkub-mobile
description: Deep plan for renaming mobile-clock to newkub-mobile, converting Cloudflare Pages to Workers, and rebuilding UX with Home + Clock + Task + Devin + Notes + Saved + Email tabs
---

## Goal

Transform `mobile-clock` into `newkub-mobile`: a personal, customizable PWA/Android app on Cloudflare Workers, with a Home-first design, bottom tabs (clock, task, devin, notes, saved, email + AI-generated tabs), per-tab and global settings, clickable top status (GitHub / Cloudflare), fixed mobile notifications, and a deploy-and-AI-fix pipeline.

## Scope

- Rename local project `D:\saas\mobile-clock` → `D:\saas\newkub-mobile`
- Rename GitHub repo `newkub/mobile-clock` → `newkub/newkub-mobile`
- Convert Cloudflare project from Pages to Workers
- Add Home page (empty/customizable)
- Bottom tabs: clock, task, devin, notes, saved, email, + dynamically added tabs
- Existing clock features (alarm, stopwatch, timer, pomodoro, reminder) live inside the **clock** tab
- Top bar: GitHub repo link, Cloudflare status, New Tab button
- Improve clock UX
- Remove swipe-up-to-unlock on first page
- New generic app logo
- Per-tab settings + global settings + logo/startup/default tab settings
- Top status toast/"winget" status on feature clicks
- Fix mobile/PWA notifications
- AI Agent page to generate new tabs from prompt
- Deploy via Wrangler and push to GitHub; error-handling button for AI fix

## Assumptions & Constraints

- User can provide `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for Wrangler
- User can provide `GH_TOKEN` or use `gh` logged-in session for repo rename
- C: drive is currently full (0 B free) → cleanup required before Wrangler can log/deploy
- D: drive has ~0.74 GB free → keep output small and run cleanup
- Project uses React 19 + Vite 8 + TypeScript 5 + Tailwind v4 + Capacitor 8 + Zustand
- No hard-coded secrets in source (API keys entered in settings)
- AI tab generation is first implemented as a local/mock feature due to no external LLM key

## Architecture

```
newkub-mobile/
├── public/
│   ├── logo.svg                    # generic app logo
│   ├── manifest.json               # new name / icons
│   └── sw.js                       # service worker for PWA notifications
├── src/
│   ├── main.tsx                    # init Capacitor + service worker + store
│   ├── App.tsx                     # root: header, tab router, home, modals
│   ├── worker.ts                   # Cloudflare Worker entry (static assets + /api)
│   ├── components/                 # shared UI
│   │   ├── Header.tsx              # top bar: repo/status/new tab
│   │   ├── TabBar.tsx              # bottom customizable tab bar
│   │   ├── StatusToast.tsx         # top status feedback
│   │   ├── LockScreen.tsx          # removed from first page, used only as optional
│   │   ├── SettingsModal.tsx       # global settings
│   │   └── ...
│   ├── tabs/
│   │   ├── Home.tsx                # empty/customizable home
│   │   ├── Clock.tsx               # clock hub with inner tabs
│   │   ├── Task.tsx                # task mockup
│   │   ├── Devin.tsx               # devin mockup
│   │   ├── Notes.tsx               # notes mockup
│   │   ├── Saved.tsx               # saved mockup
│   │   ├── Email.tsx               # email mockup
│   │   ├── Agent.tsx               # AI agent new-tab creator
│   │   └── clock-sub/
│   │       ├── Alarm.tsx
│   │       ├── Stopwatch.tsx
│   │       ├── Timer.tsx
│   │       ├── Pomodoro.tsx
│   │       └── Reminder.tsx
│   ├── lib/
│   │   ├── worker-client.ts        # API client to /api (was sync.ts)
│   │   ├── notifications.ts        # fixed native + PWA notifications
│   │   ├── status.ts               # status toast helper
│   │   ├── ai-tab.ts               # generate tab JSON from prompt
│   │   ├── github.ts               # fetch repo status
│   │   └── cloudflare.ts           # fetch worker status
│   └── store/
│       └── app.ts                  # tabs + settings + persisted state
├── worker/
│   ├── index.ts                    # Worker fetch router
│   └── api/
│       ├── alarms.ts               # converted from Pages Functions
│       ├── reminders.ts
│       └── status.ts               # GitHub/Cloudflare status proxy
├── wrangler.toml                   # Workers + static assets + D1
├── package.json                    # new scripts for wrangler dev/deploy
├── capacitor.config.ts             # new app id/name
└── .github/workflows/
    ├── ci.yml                      # typecheck/build/test
    └── deploy.yml                  # deploy to Cloudflare Workers
```

## Phases

### Phase 0 — Cleanup & Auth (foundation, fail-fast)

| No. | Task | Risk | Note |
| --- | ---- | ---- | ---- |
| 0.1 | Free disk space on C: (wrangler logs/cache) and D: | High | C: is 0 B; D: ~0.74 GB |
| 0.2 | Authenticate Wrangler (`wrangler login` or set `CLOUDFLARE_API_TOKEN`) | High | needed for deploy |
| 0.3 | Authenticate `gh` CLI or set `GH_TOKEN` | Medium | needed for repo rename |
| 0.4 | Backup current repo before rename/conversion | Low | `git bundle` |

### Phase 1 — Rename & Convert (high impact)

| No. | Task | Risk | Note |
| --- | ---- | ---- | ---- |
| 1.1 | Rename local folder `mobile-clock` → `newkub-mobile` | High | update shell cwd, stop open editors |
| 1.2 | Update `package.json` name/description | Low | |
| 1.3 | Update `capacitor.config.ts` appId/appName | Low | |
| 1.4 | Update `wrangler.toml` name, database name, add `main` + `assets` | High | converts to Workers |
| 1.5 | Convert `functions/api/alarms.ts` and `reminders.ts` to `worker/api/*.ts` | Medium | keep D1 binding |
| 1.6 | Add `worker/index.ts` router + static asset binding | Medium | `ASSETS` binding |
| 1.7 | Update `src/lib/worker-client.ts` API base + sync | Low | `/api/...` still works |
| 1.8 | Update Vite dev proxy for `/api` to local worker | Low | `vite.config.ts` |
| 1.9 | Update scripts: `dev`, `build`, `deploy` for Workers | Low | `wrangler dev`, `wrangler deploy` |
| 1.10 | Rename GitHub remote/repo `newkub/mobile-clock` → `newkub/newkub-mobile` | High | cannot undo without owner |
| 1.11 | Rename Cloudflare project / create new Workers project | High | may need manual DNS update |

### Phase 2 — Home, Tabs, Top Bar (core)

| No. | Task | Risk | Note |
| --- | ---- | ---- | ---- |
| 2.1 | Add `Home` tab: empty/customizable with widget grid | Medium | store home layout |
| 2.2 | Refactor existing tabs into `Clock` hub with inner tabs | Medium | move `Alarm/Stopwatch/Timer/Pomodoro/Reminder` under `src/tabs/clock-sub/` |
| 2.3 | Create mockup tabs: `Task`, `Devin`, `Notes`, `Saved`, `Email` | Low | placeholders |
| 2.4 | Create `Agent` tab to generate a new tab from prompt (mock) | Low | local prompt → JSON tab definition |
| 2.5 | Update `TabBar` to customizable bottom tab list | Medium | persisted in store |
| 2.6 | Update `Header` with GitHub repo, Cloudflare status, New Tab button | Medium | fetch public GitHub + `/api/status` |
| 2.7 | Remove `LockScreen` from first page; keep as optional setting | Low | no longer shows on load |
| 2.8 | Add `StatusToast` component for top status feedback | Low | used on feature clicks |
| 2.9 | Replace app logo with generic SVG and update manifest | Low | `public/logo.svg` |

### Phase 3 — Settings, UX, Notifications (polish)

| No. | Task | Risk | Note |
| --- | ---- | ---- | ---- |
| 3.1 | Redesign `SettingsModal` with sections: Global, Per-Tab, Logo, Startup | Medium | |
| 3.2 | Add settings state to Zustand: `settings` slice | Low | |
| 3.3 | Add "default startup tab" and "remember last tab" options | Low | |
| 3.4 | Improve clock tab UX (larger touch targets, better colors, haptics) | Low | |
| 3.5 | Fix notifications: permission flow, scheduling, PWA service worker | High | Capacitor exact alarms + Web Push |
| 3.6 | Add notification debug/status in settings | Low | |

### Phase 4 — Worker Status, AI Fix, Deploy (delivery)

| No. | Task | Risk | Note |
| --- | ---- | ---- | ---- |
| 4.1 | Add `/api/status` endpoint returning repo + worker status | Medium | worker uses CF API token secret |
| 4.2 | Add `/api/ai-fix` endpoint that receives error and returns suggestion | Low | can call OpenAI if key provided |
| 4.3 | Add UI "AI Fix" button on error boundary / status toast | Low | |
| 4.4 | Update GitHub Actions workflows for Workers deploy | Medium | `CLOUDFLARE_API_TOKEN` secret |
| 4.5 | `bun typecheck`, `bun build`, `bun test` | Low | must pass |
| 4.6 | `wrangler deploy` and verify live URL | High | requires auth and disk space |
| 4.7 | `git commit` and `git push` to `newkub/newkub-mobile` | Medium | |

## File Changes

| No. | File | How | Risk | Note |
| --- | ---- | --- | ---- | ---- |
| 1 | `wrangler.toml` | modify | High | Workers + assets + D1 |
| 2 | `package.json` | modify | Low | name, scripts |
| 3 | `capacitor.config.ts` | modify | Low | appId/appName |
| 4 | `README.md` | modify | Low | rebrand |
| 5 | `index.html` | modify | Low | title, logo |
| 6 | `public/manifest.json` | modify | Low | name, icons |
| 7 | `public/logo.svg` | create | Low | generic logo |
| 8 | `public/sw.js` | create | Medium | PWA notifications |
| 9 | `vite.config.ts` | modify | Low | worker proxy |
| 10 | `functions/api/alarms.ts` | delete | Medium | replaced by worker |
| 11 | `functions/api/reminders.ts` | delete | Medium | replaced by worker |
| 12 | `worker/index.ts` | create | High | Worker router |
| 13 | `worker/api/alarms.ts` | create | Low | ported |
| 14 | `worker/api/reminders.ts` | create | Low | ported |
| 15 | `worker/api/status.ts` | create | Medium | repo/worker status |
| 16 | `worker/api/ai-fix.ts` | create | Low | error → suggestion |
| 17 | `src/main.tsx` | modify | Low | sw registration, init |
| 18 | `src/App.tsx` | modify | Medium | router, home, tabs |
| 19 | `src/components/Header.tsx` | modify | Medium | repo/status/new tab |
| 20 | `src/components/TabBar.tsx` | modify | Medium | customizable tabs |
| 21 | `src/components/LockScreen.tsx` | modify | Low | removed from App default |
| 22 | `src/components/SettingsModal.tsx` | create | Medium | full settings |
| 23 | `src/components/StatusToast.tsx` | create | Low | top status |
| 24 | `src/tabs/Home.tsx` | create | Medium | customizable |
| 25 | `src/tabs/Clock.tsx` | create | Medium | clock hub |
| 26 | `src/tabs/Task.tsx` | create | Low | mockup |
| 27 | `src/tabs/Devin.tsx` | create | Low | mockup |
| 28 | `src/tabs/Notes.tsx` | create | Low | mockup |
| 29 | `src/tabs/Saved.tsx` | create | Low | mockup |
| 30 | `src/tabs/Email.tsx` | create | Low | mockup |
| 31 | `src/tabs/Agent.tsx` | create | Medium | AI tab creator |
| 32 | `src/tabs/clock-sub/Alarm.tsx` | rename from `tabs/Alarm.tsx` | Low | path change |
| 33 | `src/tabs/clock-sub/Stopwatch.tsx` | rename from `tabs/Stopwatch.tsx` | Low | path change |
| 34 | `src/tabs/clock-sub/Timer.tsx` | rename from `tabs/Timer.tsx` | Low | path change |
| 35 | `src/tabs/clock-sub/Pomodoro.tsx` | rename from `tabs/Pomodoro.tsx` | Low | path change |
| 36 | `src/tabs/clock-sub/Reminder.tsx` | rename from `tabs/Reminder.tsx` | Low | path change |
| 37 | `src/lib/sync.ts` | modify/rename | Low | to `worker-client.ts` |
| 38 | `src/lib/notifications.ts` | modify | High | fix native + PWA |
| 39 | `src/lib/status.ts` | create | Low | toast helper |
| 40 | `src/lib/ai-tab.ts` | create | Low | prompt → tab JSON |
| 41 | `src/lib/github.ts` | create | Low | public GitHub API |
| 42 | `src/lib/cloudflare.ts` | create | Medium | `/api/status` consumer |
| 43 | `src/store/app.ts` | modify | Medium | tabs + settings |
| 44 | `.github/workflows/ci.yml` | modify | Low | workers build |
| 45 | `.github/workflows/deploy.yml` | modify | Medium | workers deploy |
| 46 | `AGENTS.md` | modify | Low | update name/commands |
| 47 | `project directory` | rename | High | `D:\saas\mobile-clock` → `D:\saas\newkub-mobile` |

## Risk Assessment

| No. | Risk | Probability | Impact | Severity | Mitigation |
| --- | ---- | ----------- | ------ | -------- | ---------- |
| 1 | C: drive full breaks Wrangler logging/deploy | High | High | Critical | Run cleanup first; move wrangler/XDG to D if possible |
| 2 | Cloudflare auth token missing/expired | High | High | Critical | Request `CLOUDFLARE_API_TOKEN` before deploy |
| 3 | GitHub repo rename breaks forks/links | Medium | Medium | High | Use `gh repo rename`; ask user to confirm |
| 4 | Pages → Workers conversion breaks existing D1 data | Low | High | Medium | Keep same D1 database, rename binding name carefully |
| 5 | Capacitor notification fix requires Android permission changes | Medium | High | Medium | Add `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`; test on device |
| 6 | AI tab generation is mock-only without LLM key | High | Medium | Medium | Use deterministic template + prompt; integrate real LLM later |
| 7 | Directory rename while files open causes data loss | Low | High | Medium | Ensure no open handles; close editors; commit first |
| 8 | Service worker PWA notifications unsupported on iOS | Medium | Low | Low | Document limitation; focus Android + desktop PWA |
| 9 | Large UI refactor introduces regressions | Medium | Medium | Medium | Keep existing `__tests__` and add new ones; typecheck |

## Test Strategy

- Unit: update Zustand store tests, notification tests, worker API tests
- Integration: worker + D1 local with Miniflare, sync client + worker
- E2E: `bun build` + `wrangler dev` + browser preview to verify tabs/settings
- Manual: Android Capacitor `cap run android` for notifications/haptics
- Smoke: `bun typecheck` + `bun run test` must pass before every commit

## Timeline (rough)

| Phase | Effort | Parallel? | Depends on |
| --- | --- | --- | --- |
| Phase 0 Cleanup + Auth | 1–2 h | No | — |
| Phase 1 Rename + Workers | 4–6 h | Some | Phase 0 |
| Phase 2 Tabs + Home + Top Bar | 4–6 h | Some | Phase 1 |
| Phase 3 Settings + Notifications | 4–6 h | Some | Phase 2 |
| Phase 4 Status + AI Fix + Deploy | 3–5 h | Some | Phase 1–3 |

## Stress-Test Questions

- What if Cloudflare token is not provided? → Use local `wrangler dev` only, skip deploy.
- What if C: drive cannot be freed? → Move wrangler logs and XDG to D: manually.
- What if GitHub rename is rejected? → Create new `newkub/newkub-mobile` repo and push.
- What if D1 binding conflicts? → Create new D1 `newkub-mobile-db` and migrate schema.
- What if Capacitor exact-alarm permission fails? → Degrade to inexact notifications; inform user.

## Next Action

1. User confirms scope/priority and provides `CLOUDFLARE_API_TOKEN` / `GH_TOKEN`.
2. Run cleanup to free C:/D: space.
3. Start Phase 0 + Phase 1 implementation, then `continue`.
