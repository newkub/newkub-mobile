# New Habbit

Lock-screen style clock app for Android and PWA. Built with React 19, Vite 8, Tailwind CSS v4, and Capacitor 8.

## Features

- **Alarm** — set time, recurring days, customize sound, AI-generated voice with ElevenLabs
- **Stopwatch** — lap times, best/worst highlight, share/export
- **Timer** — quick preset chips, custom presets, live circle progress
- **Pomodoro** — focus / short break / long break, cycles, today's stats
- **Reminder** — schedule months ahead, notification panel quick-add via query params

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

## Deploy

```bash
bun run build
bun run deploy
```

## Architecture

- `src/main.tsx` — entry, init Capacitor plugins
- `src/App.tsx` — tab router + settings modal
- `src/components/` — reusable UI
- `src/tabs/` — 5 screens
- `src/lib/` — Capacitor wrapper, storage, audio, ElevenLabs, notifications
- `src/store/app.ts` — Zustand state

## Project Structure

```
.
├── android/              # Capacitor Android project
├── public/               # PWA manifest, service worker, icons
├── src/
│   ├── components/
│   ├── tabs/
│   ├── lib/
│   ├── store/
│   └── __tests__/
├── .github/workflows/    # CI, PR, deploy
└── wrangler.toml         # Cloudflare Pages config
```

## License

MIT — see `LICENSE`.

