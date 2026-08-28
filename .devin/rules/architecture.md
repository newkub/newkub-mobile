---
name: architecture
description: Architecture and coding conventions for newkub-mobile
---

## Goal

Maintain a consistent React/Capacitor/Cloudflare Workers codebase that is easy to review and deploy.

## Scope

- Frontend: React 19, TypeScript 5, Vite 8, Tailwind CSS v4
- Mobile: Capacitor 8 Android
- State: Zustand with persist middleware
- Build: `bun build` (tsc + vite)
- Backend: Cloudflare Workers (worker/) + D1

## Execute

- Run `bun typecheck` before commit
- Run `bun build` before deploy
- Run `bun cap:copy` after build when testing Android
- Run `bun deploy` for Cloudflare Workers

## Rules

- `src/lib/` holds external service wrappers (Capacitor, audio, ElevenLabs, notifications, storage, sync, status)
- `src/tabs/` holds top-level screens, no file over 250 lines
- `src/tabs/clock-sub/` holds Alarm, Stopwatch, Timer, Pomodoro, Reminder
- `src/components/` holds reusable UI
- `src/store/app.ts` is the single source of truth for shared state
- `worker/index.ts` is the Cloudflare Worker entry with static assets
- `worker/api/` holds sync and utility endpoints
- No secrets in source; API keys entered in app settings or Wrangler secrets
- Try/catch around every native/external async call
- Use semantic Tailwind colors (`text-text`, `bg-surface`, `text-primary`)
- Keep tabs/components under 250 lines where practical
