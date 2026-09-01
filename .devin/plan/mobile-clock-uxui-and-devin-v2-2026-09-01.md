---
name: mobile-clock-uxui-and-devin-v2
description: Plan for finishing Devin API v2/v3 and improving UX/UI across all wrikka-mobile routes
status: completed
created: 2026-09-01
---

## Goal

ทำ feature ทีเหลือทีเกี่ยวกับ Devin API ให้ครบ และปรับปรุง UX/UI ให้ทั้งทุก route/screen ใน wrikka-mobile

## Scope

- Devin v2: TTS, Agent tab, background notifications, attachments
- UX/UI all routes: สร้าง routes report, ปรับ empty/loading/error, transitions, accessibility
- ยึด architecture rules: tabs <250 บรรทัด, secrets ไม่ hardcode, try/catch ครบ

## Route/Screen List

| No. | Tab/Screen | Route | Tab Group | Purpose | Primary Actions | Notes |
|---|---|---|---|---|---|---|
| 1 | Home | `/` | Main | Dashboard with widgets | [Tap] add widget, [Tap] open tab | Empty state when no widgets |
| 2 | Clock | `/clock` | Main | Clock hub | [Tap] sub-tab switch | Contains 5 sub-tabs |
| 3 | Clock > Alarm | `/clock/alarm` | Clock | Manage alarms | [Tap] add/expand/toggle | AI sound via ElevenLabs |
| 4 | Clock > Stopwatch | `/clock/stopwatch` | Clock | Stopwatch | [Tap] start/stop/reset |  |
| 5 | Clock > Timer | `/clock/timer` | Clock | Timer presets | [Tap] start/reset |  |
| 6 | Clock > Pomodoro | `/clock/pomodoro` | Clock | Focus sessions | [Tap] start/pause/reset | Tracks cycles |
| 7 | Clock > Reminder | `/clock/reminder` | Clock | Date/time reminders | [Tap] add/complete/delete |  |
| 8 | Tasks | `/task` | Main | To-do list | [Tap] add/toggle/delete | Not persisted to D1 |
| 9 | Devin | `/devin` | Main | Devin session manager | [Tap] new session, [Tap] chat, [Type] reply | Onboarding if not configured |
| 10 | Notes | `/notes` | Main | Quick notes | [Type] note, [Tap] save | Local only |
| 11 | Saved | `/saved` | Main | Bookmarks | [Tap] add/open/delete | Local only |
| 12 | Email | `/email` | Main | Email drafts | [Tap] save/delete draft | Local only |
| 13 | Agent | `/agent` | Main | AI tab creator | [Type] prompt, [Tap] create | Can be enhanced with Devin |
| 14 | Settings | modal | Global | App configuration | [Tap] section, [Toggle] options | Includes Devin settings |

## Feature Tasks

| No. | Task | Phase | Effort | Status | Note |
|---|---|---|---|---|---|
| 1 | Create report-uxui-all-routes | plan | S | in_progress |  |
| 2 | Improve empty/loading/error states across all tabs | v2 | M | pending | Use skeleton, empty cards, retry |
| 3 | Add smooth view transitions | v2 | S | pending | Use Solid transitions or CSS |
| 4 | Add TTS speaker button to Devin assistant messages | v2 | S | pending | Reuse `lib/elevenlabs.ts` |
| 5 | Wire Agent tab to Devin for structured tab generation | v2 | M | pending | Use `structured_output` schema |
| 6 | Background polling / push notifications | v2 | M | pending | Service worker + Capacitor |
| 7 | Attachment support via URL or file picker | v2 | L | pending | Worker upload optional |
| 8 | Validate typecheck + build | verify | S | pending |  |
| 9 | Commit changes | ship | S | pending |  |

## File Changes

| No. | File | How | Note |
|---|---|---|---|
| 1 | `src/tabs/devin/DevinChat.tsx` | modify | Add TTS, attachments, better status |
| 2 | `src/tabs/Agent.tsx` | modify | Devin-powered tab generation |
| 3 | `src/lib/devin.ts` | modify | `createDevinSession` with `structured_output` |
| 4 | `worker/api/devin.ts` | modify | Forward `structured_output` if needed |
| 5 | `src/App.tsx` | maybe modify | View transitions |
| 6 | `src/tabs/Home.tsx` | modify | Empty/loading states |
| 7 | `src/tabs/Task.tsx` | modify | Empty state, persistence optional |
| 8 | `src/tabs/Notes.tsx` | modify | Save feedback, empty state |
| 9 | `src/tabs/Saved.tsx` | modify | Empty state, error handling |
| 10 | `src/tabs/Email.tsx` | modify | Empty state, form validation |
| 11 | `src/tabs/Custom.tsx` | modify | Empty/default view |
| 12 | `src/lib/notifications.ts` | modify | Background polling helpers |
| 13 | `.devin/reports/` | create | report-uxui-all-routes |

## Notes

- ใช้ subagents สำหรับงานแยกอิสระถ้าเหมาะสม
- ถ้า file ใดยาวเกิน 250 บรรทัด ให้แยกเป็น sub-components
- ห้าม commit secrets
- ทุก async call ต้องมี try/catch
