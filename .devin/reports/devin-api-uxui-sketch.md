---
name: devin-api-uxui-sketch
description: UX/UI sketch สำหรับการ integrate Devin API เข้ากับ wrikka-mobile
created: 2026-09-01
---

## Goal

ออกแบบหน้าจอ Devin tab ใหม่ใน wrikka-mobile เพื่อใช้ Devin API v3 สร้าง/คุย/ติดตาม session แบบเต็มรูปแบบบน Android (Capacitor) และ PWA

## Scope

- Platform: Android (Capacitor 8) และ PWA
- Framework: SolidJS + UnoCSS
- Navigation: ยึด bottom tab bar เดิม
- Integration: Devin API v3 ผ่าน backend proxy (Cloudflare Workers)

## Screen Summary

| No. | Screen | Purpose | Key Actions |
|---|---|---|---|
| 1 | `devin-sessions-list` | ดูประวัติ session ทั้งหมด | [Tap] เปิด chat, [Tap] สร้างใหม, [Pull] refresh |
| 2 | `devin-new-session` | สร้าง session ใหม | [Type] prompt, [Select] mode, [Tap] start |
| 3 | `devin-chat` | คุยกับ session ปัจจุบัน | [Type] reply, [Tap] action, [Scroll] history |
| 4 | `devin-question` | ตอบคำถามที Devin ถาม | [Select] ตัวเลือก, [Type] ข้อความ, [Tap] send |
| 5 | `devin-session-actions` | จัดการ session | [Tap] pause/resume, [Tap] archive, [Tap] open web |
| 6 | `settings-devin` | ตั้งค่า API และ notifications | [Type] key, [Toggle] proxy, [Toggle] notify |

## User Flow

```
Home / TabBar
    |
    v
[Devin tab] --(no session)--> [New Session]
    |                                  |
    | (has active session)             v
    v                              [POST /sessions]
[Session List]                       |
    |                                v
    +-- [Tap session] --------> [Chat screen]
    |                                |
    |                                v
    |                        [Poll status/messages]
    |                                |
    |                  (waiting_for_user / suspended)
    |                                |
    |                                v
    |                         [Question card]
    |                                |
    +--------------------------------+
```

## Screen Sketches

### 1. Devin Session List

```text
┌──────────────────────────────┐
│ Devin            [+]    [⚙]  │
├──────────────────────────────┤
│ [Search sessions...          │
├──────────────────────────────┤
│  Fix alarm bug               │
│   running ············· 2m   │
│                              │
│  Plan notes tab              │
│   waiting for you ■■ 5m      │
│                              │
│  Review clock UX             │
│   completed 1h               │
├──────────────────────────────┤
│ [Home] [Clock] [Devin] [New] │
└──────────────────────────────┘
```

Annotations:
- สถานะ session แสดงด้วย dot + ข้อความสั้น
- สีพื้นหลังของแถวต่างกันตาม `status_detail`
- [Tap] แถว -> เปิด chat
- [Long press] แถว -> เปิด action menu
- Empty state: แสดง "No sessions yet. Start one!" + ปุ่ม [New Session]
- Error state: แสดง snackbar + ปุ่ม retry

### 2. New Session

```text
┌──────────────────────────────┐
│ New session             [X]  │
├──────────────────────────────┤
│ Context                      │
│ [current project        ▼]   │
├──────────────────────────────┤
│ Prompt                       │
│ ┌──────────────────────────┐ │
│ │ Add a pomodoro summary   │ │
│ │ card to the clock tab    │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ Mode: [normal] [fast] [lite] │
├──────────────────────────────┤
│ [     Start session      ]   │
└──────────────────────────────┘
```

Annotations:
- [Tap] "Context" เปิด dropdown เลือก repo/ไฟล์สำหรับ prompt
- ถ้าไม่มี context ให้ปล่อย `none`
- [Tap] "Mode" เลือก `normal`, `fast`, `lite` ตาม `devin_mode`
- [Tap] [Start] -> สร้าง session แล้วไป chat
- Loading: ปุ่มเปลี่ยนเป็น spinner + disabled
- Error: แสดงข้อความสี warning

### 3. Devin Chat

```text
┌──────────────────────────────┐
│ Fix alarm bug     [pause]    │
│ running...                   │
├──────────────────────────────┤
│ You                          │
│ Add pomodoro summary card    │
├──────────────────────────────┤
│ Devin                        │
│ Sure. I need to edit         │
│ src/tabs/clock-sub/          │
│ Pomodoro.tsx. Allow?         │
├──────────────────────────────┤
│ [Allow]  [Decline]  [Ask]    │
├──────────────────────────────┤
│ [Type a reply...]       [>]  │
└──────────────────────────────┘
```

Annotations:
- ข้อความ Devin อยู่ซ้าย ข้อความ user อยู่ขวา
- สีพื้นหลัง bubble ต่างกัน (`bg-surface-2` vs `bg-primary/20`)
- Header แสดง `status` และ `status_detail`
- [Tap] [pause] ส่งข้อความ `stop` หรือ เปิด action menu
- [Tap] [>] ส่งข้อความ
- [Scroll] โหลดข้อความเก่า (cursor pagination)
- Loading: skeleton bubbles ขณะรอ assistant

### 4. Interactive Question Card

```text
┌──────────────────────────────┐
│ Devin asks                   │
├──────────────────────────────┤
│ Which stack for this tab?    │
├──────────────────────────────┤
│ ( ) React Native             │
│ (*) Solid + Capacitor        │
│ ( ) Flutter                  │
├──────────────────────────────┤
│ Other: [____________]        │
├──────────────────────────────┤
│ [      Send answer       ]   │
└──────────────────────────────┘
```

Annotations:
- ใช้ radio สำหรับ single-select หรือ checkbox สำหรับ multi-select
- ถ้า Devin ถามแบบ open-ended ให้แสดง text input ธรรมดา
- ตัวเลือกดึงจาก parsing ข้อความ Devin ล่าสุด
- [Tap] [Send answer] ส่ง `POST /messages`
- สถานะ session เปลี่ยน `waiting_for_user` -> `running`

### 5. Session Actions

```text
┌──────────────────────────────┐
│ Session actions              │
├──────────────────────────────┤
│ Status: waiting for you      │
│ Time: 12m                    │
│ ACU: 0.4                     │
├──────────────────────────────┤
│ [Open in web]  [Copy URL]    │
│ [Pause]        [Resume]      │
│ [Archive]      [Share]       │
└──────────────────────────────┘
```

Annotations:
- เปิดจาก [Long press] บน session หรือ ไอคอน ... ใน chat
- [Open in web] เปิด browser ด้วย `session.url`
- [Pause] ส่งข้อความหยุด / [Resume] ส่ง `POST /messages` เปล่า
- [Archive] ส่ง `POST /sessions/{id}/archive`
- [Share] ใช้ Capacitor Share ส่ง `session.url`

### 6. Devin Settings

```text
┌──────────────────────────────┐
│ Devin settings               │
├──────────────────────────────┤
│ API config                   │
│ Org ID: [org-xxx         ]   │
│ Key:    [cog-xxx         ]   │
├──────────────────────────────┤
│ Proxy                        │
│ [ ] Use Cloudflare Worker    │
├──────────────────────────────┤
│ Notifications                │
│ [x] When completed           │
│ [x] When needs input         │
├──────────────────────────────┤
│ [Save]                       │
└──────────────────────────────┘
```

Annotations:
- API key เก็บใน Capacitor Preferences / localStorage (encrypted ถ้า native รองรับ)
- แนะนำให้ใช้ proxy เสมอเพื่อซ่อน key
- Notifications ใช้ Capacitor Local Notifications หรือ service worker
- [Save] ตรวจสอบ key ด้วย `GET /v3/organizations/{org_id}/sessions` ก่อน

## States

- Loading: skeleton list, skeleton chat, spinner บน button
- Empty: ไม่มี session -> ชวนเริ่มใหม่
- Error: network / 401 / 403 -> snackbar + retry
- Offline: แคชล่าสุด แสดง badge "offline"
- Waiting: แสดง question card overlay

## Accessibility

- ทุกปุ่มมี `aria-label`
- สีไม่อยู่เพียงอย่างเดียว มีไอคอน/ข้อความประกอบ
- ขนาด touch target ไม่ต่ำกว่า 44x44 dp
- รองรับ screen reader ด้วย heading และ list role

## Next Action

1. สร้าง report-ansi สำหรับสถานะและ flow
2. สร้าง plan ทีมี file changes, architecture, และ phase
3. เริ่ม implement ตาม plan: lib/devin.ts -> tabs/Devin.tsx -> worker proxy
