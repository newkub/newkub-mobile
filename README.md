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

## Environment

No required env vars. For AI voice in alarms, enter your ElevenLabs API key in the in-app Settings.
