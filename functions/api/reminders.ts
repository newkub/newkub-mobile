import type { Reminder } from "../../src/store/app";

interface Env {
  DB: D1Database;
}

function rowsToReminders(rows: unknown[]): Reminder[] {
  return rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    date: r.date,
    time: r.time,
    repeat: r.repeat ? (r.repeat as Reminder["repeat"]) : "none",
    enabled: Boolean(r.enabled),
    createdAt: r.created_at,
  }));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return new Response("Missing userId", { status: 400 });

  const { results } = await env.DB
    .prepare("SELECT * FROM reminders WHERE user_id = ? ORDER BY date, time")
    .bind(userId)
    .all();

  return Response.json(rowsToReminders(results ?? []));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return new Response("Missing userId", { status: 400 });

  const reminder: Reminder = await request.json();
  await env.DB
    .prepare(
      `INSERT INTO reminders (user_id, id, title, date, time, repeat, enabled, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, id) DO UPDATE SET
         title = excluded.title,
         date = excluded.date,
         time = excluded.time,
         repeat = excluded.repeat,
         enabled = excluded.enabled,
         created_at = excluded.created_at`
    )
    .bind(
      userId,
      reminder.id,
      reminder.title,
      reminder.date,
      reminder.time,
      reminder.repeat,
      reminder.enabled ? 1 : 0,
      reminder.createdAt ?? Date.now()
    )
    .run();

  return Response.json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const id = url.searchParams.get("id");
  if (!userId || !id) return new Response("Missing userId or id", { status: 400 });

  await env.DB.prepare("DELETE FROM reminders WHERE user_id = ? AND id = ?").bind(userId, id).run();
  return Response.json({ ok: true });
};
