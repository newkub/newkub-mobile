---
name: move-to-wrikka-platform-and-uxui
description: Plan for moving mobile-clock to wrikka-platform/apps/mobile, renaming, and improving all UX/UI
status: in_progress
created: 2026-09-01
---

## Goal

ย้าย `D:\saas\mobile-clock` ไปยัง `D:\saas\wrikka-platform\apps\mobile` เปลี่ยนชื่อโปรเจค ปรับ UX/UI ทุก route/component ให้ครบ แล้ว commit + push

## Scope

- Move/rename project folder
- Update workspace configs (turbo/pnpm/moon/bun workspace) ถ้ามี
- Update package name and internal paths
- Improve UX/UI ทุก routes และ components
- Run validation and commit/push

## Steps

| No. | Step | Status | Note |
|---|---|---|---|
| 1 | Verify destination and existing workspace | in_progress | ตรวจ `D:\saas\wrikka-platform` |
| 2 | Move folder to `apps/mobile` | pending | ใช้ `Move-Item` / `mv` แล้ว `cd` |
| 3 | Update workspace package configs | pending | `package.json`, `turbo.json`, etc. |
| 4 | Improve UX/UI all routes/components | pending | ทบทวนและปรับทั่วไป |
| 5 | Validate typecheck + build + test | pending |  |
| 6 | Git commit and push | pending | อาจต้องตรวจ remote |

## File Changes Expected

| No. | File | How | Note |
|---|---|---|---|
| 1 | project path | move | `D:\saas\mobile-clock` -> `D:\saas\wrikka-platform\apps\mobile` |
| 2 | `package.json` | modify | `name: "mobile"` |
| 3 | `wrangler.toml` | maybe modify | ชื่อ Worker/DB อาจต้องเปลี่ยน |
| 4 | workspace config ใน `wrikka-platform` | modify | เพิม `apps/mobile` |
| 5 | `src/tabs/*.tsx` | modify | UX/UI improvements |
| 6 | `src/components/*.tsx` | modify | UX/UI improvements |
| 7 | `src/store/app.ts` | maybe modify | UX states |
| 8 | `src/App.tsx` | maybe modify | transitions |

## Notes

- ต้องตรวจว่า `D:\saas\wrikka-platform` มี workspace manager ใด
- ถ้ามี monorepo tooling → ต้องอัปเดต paths
- git remote ต้องตรวจหลังย้าย
- ย้ายโฟลเดอร์ คือ destructive op ต้องมี confirmation แล้ว dry-run
