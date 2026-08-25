---
name: new-habbit
description: Lock-screen style Android/PWA clock app with Alarm, Stopwatch, Timer, Pomodoro, Reminder
---

## Goal

Ship `new-habbit` ให้ทำงานบน Android (Capacitor 8) และ PWA บน Cloudflare Pages โดยมี 5 tabs หลัก

## Scope

- Web app: React 19 + Vite 8 + TypeScript 7 + Tailwind CSS v4
- Mobile wrapper: Capacitor 8 (Android only)
- Storage: Capacitor Preferences + Zustand persist
- Notifications: Capacitor Local Notifications
- AI sound: ElevenLabs API (TTS)
- Deploy: Cloudflare Pages

## Commands

```bash
# dev
bun dev

# build web
bun build

# typecheck
bun typecheck

# add Android platform (requires Android SDK)
bun cap add android

# sync web assets to Android
bun cap:sync

# open Android Studio
bun cap:open

# deploy to Cloudflare Pages
bun deploy
```

## Architecture

- `src/main.tsx` — entry, init Capacitor plugins
- `src/App.tsx` — tab router + settings modal
- `src/components/` — reusable UI (Button, Input, Switch, TimePicker, CircleProgress, TabBar, Header)
- `src/tabs/` — 5 screens: Alarm, Stopwatch, Timer, Pomodoro, Reminder
- `src/lib/` — Capacitor wrapper, storage, audio, ElevenLabs, notifications
- `src/store/app.ts` — Zustand state persisted locally

## Expected Outcome

- `bun build` passes
- PWA deploys to Cloudflare Pages
- Android project structure is ready for `cap add android` once Android SDK is installed
