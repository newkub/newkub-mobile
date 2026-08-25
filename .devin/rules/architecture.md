---
name: architecture
description: Architecture and coding conventions for new-habbit
---

## Goal

Maintain a consistent React/Capacitor codebase that is easy to review and deploy.

## Scope

- Frontend: React 19, TypeScript 5, Vite 8, Tailwind CSS v4
- Mobile: Capacitor 8 Android
- State: Zustand with persist middleware
- Build: `bun build` (tsc + vite)

## Execute

- Run `bun typecheck` before commit
- Run `bun build` before deploy
- Run `bun cap:copy` after build when testing Android

## Rules

- `src/lib/` holds external service wrappers (Capacitor, audio, ElevenLabs, notifications, storage)
- `src/tabs/` holds top-level screens, no file over 250 lines
- `src/components/` holds reusable UI
- `src/store/app.ts` is the single source of truth for shared state
- No secrets in source; API keys entered in app settings
- Try/catch around every native/external async call
- Use semantic Tailwind colors (`text-text`, `bg-surface`, `text-primary`)
