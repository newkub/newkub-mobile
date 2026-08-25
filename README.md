# New Habbit

Lock-screen style clock app for Android and PWA. Built with React 19, Vite 8, Tailwind CSS v4, Capacitor 8 and Cloudflare Pages Functions + D1.

## Features

- **Lock Screen** — full-screen clock and date, tap to unlock
- **Onboarding** — first-visit setup for notifications, cloud sync and ElevenLabs key
- **Alarm** — set time, recurring days, customize sound, AI-generated voice with ElevenLabs
- **Stopwatch** — lap times, best/worst highlight, share/export
- **Timer** — quick preset chips, custom presets, live circle progress
- **Pomodoro** — focus / short break / long break, cycles, today's stats
- **Reminder** — schedule months ahead, recurring daily/weekly/monthly
- **Cloud Sync** — alarms and reminders sync across devices via Cloudflare Pages Functions and D1

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
| Backend | Cloudflare Pages Functions |
| Database | Cloudflare D1 |
| Deploy | Cloudflare Pages |

## Getting Started

```bash
bun install
bun dev
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
bunx wrangler d1 create new-habbit-db
bunx wrangler d1 execute new-habbit-db --remote --file=schema.sql
```

Copy the printed `database_id` into `wrangler.toml` if it differs.

## Architecture

- `src/main.tsx` — entry, init Capacitor plugins, sync hydration
- `src/App.tsx` — lock screen, tab router, settings modal, onboarding
- `src/components/` — reusable UI
- `src/tabs/` — 5 screens
- `src/lib/` — Capacitor wrapper, storage, audio, ElevenLabs, notifications, sync API
- `src/store/app.ts` — Zustand state with automatic push to worker
- `functions/api/alarms.ts` — Pages Function for alarm sync
- `functions/api/reminders.ts` — Pages Function for reminder sync

## Project Structure

```
.
├── android/              # Capacitor Android project
├── functions/            # Cloudflare Pages Functions
├── public/               # PWA manifest, service worker, icons
├── src/
│   ├── components/
│   ├── tabs/
│   ├── lib/
│   ├── store/
│   └── __tests__/
├── .github/workflows/    # CI, PR, deploy, typecheck
├── schema.sql            # D1 schema
└── wrangler.toml         # Cloudflare Pages + D1 config
```

## Sync Model

- Local state is persisted in Capacitor Preferences / localStorage.
- Each device generates a `userId` stored locally.
- On load, the app pulls alarms/reminders from D1 and replaces local if server has data.
- Every add/update/remove pushes the change to Pages Functions.
- Sync is best-effort and works silently offline.

## License

MIT — see `LICENSE`.
