---
name: devin-api-integration
description: Plan for integrating Devin API into wrikka-mobile
status: completed
created: 2026-09-01
---

## Goal

เชื่อมต่อ Devin API v3 เข้ากับ wrikka-mobile เปลี่ยน Devin tab จาก mock เป็น chat/session manager ทีใช้งานได้จริง บน Android (Capacitor) และ PWA โดยใช้ API ให้เต็มประสิทธิภาพผ่าน backend proxy, polling ทีประหยัด, และ notification

## Scope

- Worker proxy สำหรับ Devin API (ซ่อน key)
- Client `lib/devin.ts` สำหรับ session, messages, polling
- หน้า Devin tab ใหม่: session list, new session, chat, question card
- ตั้งค่า API ใน SettingsModal
- Notification เมื่อ session รอคำตอบหรือเสร็จ
- รองรับ Capacitor และ PWA

## New Features

| No. | Feature | Description | Phase | Effort | MVP Score | Risk |
|---|---|---|---|---|---|---|
| 1 | Devin session list | แสดง/ค้นหา/เลือก session จาก API | MVP | M | 10 | low |
| 2 | New session composer | สร้าง session ด้วย prompt + mode | MVP | M | 10 | low |
| 3 | Live chat view | แสดงข้อความ ตอบกลับ ดู status | MVP | M | 10 | low |
| 4 | Interactive question card | ตอบคำถาม Devin แบบ text / choice | MVP | M | 9 | medium |
| 5 | Worker Devin proxy | `/api/devin/*` forward + error handling | MVP | M | 9 | medium |
| 6 | Devin settings | บันทึก org/key/proxy/notification | MVP | S | 8 | low |
| 7 | Session actions | pause/resume/archive/open web/share | MVP | S | 7 | low |
| 8 | Efficient polling | backoff + cursor pagination + stop on terminal | MVP | M | 9 | low |
| 9 | Local notifications | แจ้งเตือนเมื่อ waiting/completed | v2 | M | 7 | medium |
| 10 | TTS for Devin messages | อ่านข้อความ Devin ด้วย ElevenLabs | v2 | S | 6 | low |
| 11 | Session sync via D1 | เก็บ session metadata บน D1 | v2 | L | 6 | medium |
| 12 | Agent tab with Devin | ใช้ Devin plan แล้วสร้าง custom tab | v2 | L | 7 | high |

## What You Do

| No. | Phase | Action | Status | Note |
|---|---|---|---|---|
| 1 | Prepare | อ่าน AGENTS.md, package.json, tabs/Devin.tsx, worker | done | ใช้ SolidJS ไม่ใช React ตาม AGENTS |
| 2 | Analyze | ค้นหา Devin API docs | done | REST v3, no webhook, must poll |
| 3 | Report | สร้าง report-uxui-sketch + report-ansi | done | อยู่ใน .devin/reports |
| 4 | Plan | สร้าง plan นี้ | in_progress | รอ approve / continue |
| 5 | Write | Worker proxy + lib/devin.ts | pending | สร้างไฟล์ใหม |
| 6 | Write | Devin tab components | pending | แยกย่อยไม่เกิน 250 บรรทัด |
| 7 | Write | Settings + notifications | pending | ใช้ Preferences |
| 8 | Validate | typecheck + test + build | pending | bun typecheck, bun run test |
| 9 | Report | /report-session-status | pending | สรุป progress |

## File Changes

| No. | File | How to | Risk | Note |
|---|---|---|---|---|
| 1 | `worker/index.ts` | modify | medium | add `/api/devin/*` routes |
| 2 | `worker/api/devin.ts` | create | medium | proxy endpoints |
| 3 | `src/lib/devin.ts` | create | low | client + types |
| 4 | `src/types.ts` | modify | low | add Devin types |
| 5 | `src/store/app.ts` | modify | low | add devin settings |
| 6 | `src/tabs/Devin.tsx` | modify | medium | replace mock with real UI |
| 7 | `src/tabs/devin/` | create | low | split components |
| 8 | `src/components/SettingsModal.tsx` | modify | low | add Devin settings section |
| 9 | `src/lib/notifications.ts` | modify | medium | add Devin notifications |
| 10 | `src/lib/storage.ts` | maybe no change | low | ใช้ Preferences |
| 11 | `wrangler.toml` | maybe no change | low | secrets ใช้ wrangler secret |

## File Structure

```
D:\saas\mobile-clock
├── .devin/
│   ├── plan/devin-api-integration-2026-09-01.md
│   └── reports/
│       ├── devin-api-uxui-sketch.md
│       └── devin-api-status.ansi
├── worker/
│   ├── index.ts
│   └── api/
│       ├── devin.ts          (new)
│       ├── ai-fix.ts
│       ├── alarms.ts
│       ├── reminders.ts
│       ├── status.ts
│       ├── deploy.ts
│       └── push.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── types.ts
│   ├── lib/
│   │   ├── devin.ts          (new)
│   │   ├── capacitor.ts
│   │   ├── notifications.ts
│   │   ├── storage.ts
│   │   └── ...
│   ├── tabs/
│   │   ├── Devin.tsx         (replace)
│   │   └── devin/            (new)
│   │       ├── SessionList.tsx
│   │       ├── ChatView.tsx
│   │       ├── NewSession.tsx
│   │       └── QuestionCard.tsx
│   ├── components/
│   │   ├── SettingsModal.tsx (add section)
│   │   └── ...
│   └── store/
│       └── app.ts            (add devin state)
```

## Notes

- Devin API ไม่มี webhook outbound ต้อง poll จาก app
- API key `cog_...` ต้องเก็บบน Worker (ใช้ wrangler secret) ห้ามใส่ใน source
- แนะนำให้ user ใช้ proxy บน Worker โดย default
- ต้องเพิ่ม permission ของ service user: `UseDevinSessions`, `ViewOrgSessions`
- ถ้า status terminal (`exit`/`error`/`suspended` ไม่ใช่ waiting) ให้หยุด poll
- ใช้ `devin_mode: fast` เพื่อประหยัด ACU สำหรับ task ง่าย
