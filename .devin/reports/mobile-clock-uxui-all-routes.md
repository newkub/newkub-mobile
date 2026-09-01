---
name: mobile-clock-uxui-all-routes
description: UX/UI routes report for wrikka-mobile
created: 2026-09-01
---

## Goal

รวบรวม routes/screens ทั้งหมดของ wrikka-mobile พร้อม UX metadata เพื่อปรับปรุง UX/UI

## Navigation Pattern

- โครงสร้างหลัก: single-page app ด้วย bottom tab bar
- เปลี่ยน tab ด้วย [Tap] บน `TabBar`
- Clock มี sub-tab bar ด้านล่างของ content
- Settings และ Onboarding แสดงเป็น modal overlay
- Custom tab ถูกสร้างจาก Agent tab แล้วเพิมเข้า tab bar

## Route Table

| No. | Tab/Screen | Route | Method | Tab Group | Purpose | Primary Actions | UX Status | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Home | `/` | [Tap] tab | Main | Dashboard with widgets | [Tap] add widget, [Tap] open tab, [Tap] remove widget | [OK] | Empty state ดี แต่ยังไม่มี loading skeleton |
| 2 | Clock | `/clock` | [Tap] tab | Main | Clock hub | [Tap] sub-tab switch | [OK] | Sub-tabs ชัดเจน |
| 3 | Clock > Alarm | `/clock/alarm` | [Tap] sub-tab | Clock | Manage alarms | [Tap] add, [Tap] expand, [Toggle] enable, [Tap] delete | [OK] | Empty state ดี มี AI sound editor |
| 4 | Clock > Stopwatch | `/clock/stopwatch` | [Tap] sub-tab | Clock | Stopwatch | [Tap] start/stop/reset | [MISSING] | ยังไม่มี empty/idle state ทีชัด |
| 5 | Clock > Timer | `/clock/timer` | [Tap] sub-tab | Clock | Timer presets | [Tap] start/reset | [OK] | ต้องเช็ค loading |
| 6 | Clock > Pomodoro | `/clock/pomodoro` | [Tap] sub-tab | Clock | Focus timer | [Tap] start/pause/reset, [Tap] phase | [OK] | มี feedback ดี |
| 7 | Clock > Reminder | `/clock/reminder` | [Tap] sub-tab | Clock | Date/time reminders | [Tap] add/complete/delete | [OK] | Sync ผ่าน Worker |
| 8 | Tasks | `/task` | [Tap] tab | Main | To-do list | [Type] task, [Tap] add, [Tap] toggle, [Tap] delete | [WARN] | ไม่มี empty state แบบ visual, ไม่ persist |
| 9 | Devin | `/devin` | [Tap] tab | Main | Devin session manager | [Tap] new session, [Tap] select session, [Type] chat, [Tap] archive | [OK] | Onboarding, chat, question card ทำแล้ว |
| 10 | Notes | `/notes` | [Tap] tab | Main | Quick notes | [Type] note, [Tap] save | [WARN] | Empty state ไม่ชัด, ไม่มี loading/saving feedback |
| 11 | Saved | `/saved` | [Tap] tab | Main | Bookmarks | [Type] title/URL, [Tap] add, [Tap] open, [Tap] delete | [WARN] | Empty state ธรรมดาเกินไป |
| 12 | Email | `/email` | [Tap] tab | Main | Email drafts | [Type] to/subject/body, [Tap] save, [Tap] delete | [WARN] | Empty state ไม่ชัด, ไม่มี validation feedback |
| 13 | Agent | `/agent` | [Tap] tab | Main | AI tab creator | [Type] prompt, [Tap] create | [WARN] | ยังไม่มี loading/result state ทีดี |
| 14 | Custom tab | `/custom/:id` | [Tap] tab | Main | Placeholder custom tab |  | [MISSING] | แสดง placeholder อย่างเดียว |
| 15 | Settings | `modal` | [Tap] icon | Global | App configuration | [Tap] section, [Toggle] options, [Tap] save | [OK] | แบ่ง section ชัด |
| 16 | Onboarding | `modal` | [Tap] first-visit | Global | First-run welcome | [Tap] dismiss | [OK] | แสดงครั้งแรก |

## Gaps / UX Improvements

| No. | Screen | Gap | Suggested Fix |
|---|---|---|---|
| 1 | All tabs | ไม่มี loading skeleton ทั่วไป | เพิม `Skeleton` component |
| 2 | Stopwatch | ไม่มี idle/empty state | เพิม centered start state |
| 3 | Tasks | empty state ธรรมดา, ไม่ persist | ใช้ visual empty card, persist to store |
| 4 | Notes | ไม่มี saved feedback, empty ไม่ชัด | เพิม last-saved indicator, empty card |
| 5 | Saved | empty ไม่ชัด | ใช้ visual empty card |
| 6 | Email | empty ไม่ชัด, ไม่มี validation | ใช้ empty card, highlight empty required |
| 7 | Agent | ไม่มี loading/result | เพิม generating state, preview, error state |
| 8 | Custom tab | placeholder เปล่า | อนุญาตให้ Devin สร้าง content preview หรือ widget |

## Navigation Summary

- 16 screens/routes
- 5 ในกลุ่ม Clock
- 10 กลุ่ม Main
- 2 modal
- 1 dynamic custom route

## Next Action

1. สร้าง `Skeleton` component
2. แก้ empty/loading/error states ตาม gaps
3. ต่อ v2 Devin features (TTS, Agent, attachments, background)
4. ตรวจ typecheck + build
