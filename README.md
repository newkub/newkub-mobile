# Newkub Mobile

Personal customizable app for Android and PWA. Built with React 19, Vite 8, Tailwind CSS v4, Capacitor 8 and Cloudflare Workers + D1.

## Features

- **Home** — empty customizable home screen with widgets
- **Clock** — alarm, stopwatch, timer, pomodoro, reminder
- **Task, Devin, Notes, Saved, Email** — placeholder/mockup tabs ready to customize
- **AI Agent** — create new tabs from prompts
- **Settings** — per-tab settings + global settings + logo/startup options
- **Cloud Sync** — alarms and reminders sync across devices via Cloudflare Workers and D1
- **Notifications** — Capacitor local notifications + PWA push notifications
- **Top Bar** — GitHub repo and Cloudflare status, clickable
- **Android Home Screen Widget** — clock widget

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Mobile | Capacitor 8 (Android only) |
| State | Zustand + persist |
| Icons | lucide-react |
| AI TTS | ElevenLabs API |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 |
| Deploy | Cloudflare Workers |

## Getting Started

```bash
bun install
bun dev        # Vite dev server
bun dev:worker # Wrangler dev for the Worker (run in another terminal)
```

## Build for Android

Requires Android Studio and Android SDK installed.

```bash
bun run build
bun cap add android
bun cap:sync
bun cap:open
```

## Test

```bash
bun run test
```

## Deploy

```bash
bun run build
bun run deploy
```

## D1 Setup

```bash
bunx wrangler d1 create newkub-mobile-db
bunx wrangler d1 execute newkub-mobile-db --remote --file=schema.sql
```

Copy the printed `database_id` into `wrangler.toml` if it differs.

## Architecture

- `src/main.tsx` — entry, init Capacitor plugins, sync hydration
- `src/App.tsx` — home + tab router + settings modal
- `src/components/` — reusable UI
- `src/tabs/` — top-level screens: Home, Clock, Task, Devin, Notes, Saved, Email, Agent
- `src/tabs/clock-sub/` — Alarm, Stopwatch, Timer, Pomodoro, Reminder
- `src/lib/` — Capacitor wrapper, storage, audio, ElevenLabs, notifications, sync API
- `src/store/app.ts` — Zustand state with automatic push to worker
- `worker/index.ts` — Cloudflare Worker entry with static assets
- `worker/api/alarms.ts` — sync alarms
- `worker/api/reminders.ts` — sync reminders
- `worker/api/status.ts` — GitHub/Cloudflare status
- `worker/api/ai-fix.ts` — error → fix suggestion

## Project Structure

```
.
├── android/              # Capacitor Android project
├── public/               # PWA manifest, service worker, icons
├── src/
│   ├── components/
│   ├── tabs/
│   │   └── clock-sub/
│   ├── lib/
│   ├── store/
│   └── __tests__/
├── worker/               # Cloudflare Worker
├── .github/workflows/    # CI, PR, deploy, typecheck
├── schema.sql            # D1 schema
└── wrangler.toml         # Cloudflare Workers + D1 + static assets config
```

## Android Widget

A home screen clock widget is included in the Android app. Long-press on the home screen, select `Newkub Mobile`, and place the widget.

## Play Store

See `RELEASING.md` for building the release AAB and uploading to Google Play.

## Sync Model

- Local state is persisted in Capacitor Preferences / localStorage.
- Each device generates a `userId` stored locally.
- On load, the app pulls alarms/reminders from D1 and replaces local if server has data.
- Every add/update/remove pushes the change to the Worker.
- Sync is best-effort and works silently offline.

## License

MIT — see `LICENSE`.
