---
name: new-habbit
description: Lock-screen style Android/PWA clock app with Alarm, Stopwatch, Timer, Pomodoro, Reminder
---

## Goal

Ship `new-habbit` ให้ทำงานบน Android (Capacitor 8) และ PWA บน Cloudflare Pages โดยมี 5 tabs หลัก พร้อม Cloudflare Worker + D1 sync และ UX ที่ใช้งานง่าย

## Scope

- Web app: React 19 + Vite 8 + TypeScript 5 + Tailwind CSS v4
- Mobile wrapper: Capacitor 8 (Android only)
- Storage: Capacitor Preferences + Zustand persist
- Sync: Cloudflare Pages Functions + D1 สำหรับ alarms/reminders
- Notifications: Capacitor Local Notifications
- AI sound: ElevenLabs API (TTS)
- Deploy: Cloudflare Pages + Wrangler
- Review: /review-codebase

## Execute

```bash
# dev
bun dev

# build web
bun build

# typecheck
bun typecheck

# test
bun run test

# add Android platform (requires Android SDK)
bun cap add android

# sync web assets to Android
bun cap:sync

# open Android Studio
bun cap:open

# deploy to Cloudflare Pages
bun deploy

# create D1 database
bunx wrangler d1 create new-habbit-db
```

## Rules

- ใช้ React hooks และ Zustand สำหรับ state
- ห้าม hardcode secrets ใน source
- TypeScript strict mode
- ทุก async external call (Capacitor, ElevenLabs, Worker) ต้องมี try/catch
- ทุก component/tab ควรยาวไม่เกิน 250 บรรทัด
- PWA manifest และ service worker ต้องครบถ้วน
- Android project ใช้ `server.cleartext` disabled สำหรับ production
- ข้อมูล alarm/reminder sync ผ่าน `/api/alarms` และ `/api/reminders` บน Pages Functions
- ข้อมูล sensitive ทั้งหมด (ElevenLabs key, user id) เก็บบนอุปกรณ์ผ่าน Preferences / localStorage

## Architecture

- `src/main.tsx` — entry, init Capacitor plugins
- `src/App.tsx` — tab router + settings modal + onboarding
- `src/components/` — reusable UI (Button, Input, Switch, TimePicker, CircleProgress, TabBar, Header)
- `src/tabs/` — 5 screens: Alarm, Stopwatch, Timer, Pomodoro, Reminder
- `src/lib/` — Capacitor wrapper, storage, audio, ElevenLabs, notifications, sync API
- `src/store/app.ts` — Zustand state persisted locally
- `functions/api/alarms.ts` — Cloudflare Pages Function สำหรับ alarm sync
- `functions/api/reminders.ts` — Cloudflare Pages Function สำหรับ reminder sync
- `wrangler.toml` — Pages + D1 binding config

## Expected Outcome

- `bun build` passes
- `bun run test` passes
- PWA deploys to Cloudflare Pages
- D1 sync endpoint พร้อมใช้
- Android project structure is ready for `cap add android` once Android SDK is installed
