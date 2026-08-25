import type { Alarm } from "../../src/store/app";

interface Env {
  DB: D1Database;
}

function rowsToAlarms(rows: unknown[]): Alarm[] {
  return rows.map((r: any) => ({
    id: r.id,
    hour: r.hour,
    minute: r.minute,
    label: r.label ?? "",
    enabled: Boolean(r.enabled),
    repeat: JSON.parse(r.repeat),
    sound: r.sound,
    soundUrl: r.sound_url ?? undefined,
    aiText: r.ai_text ?? undefined,
  }));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return new Response("Missing userId", { status: 400 });

  const { results } = await env.DB
    .prepare("SELECT * FROM alarms WHERE user_id = ? ORDER BY hour, minute")
    .bind(userId)
    .all();

  return Response.json(rowsToAlarms(results ?? []));
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return new Response("Missing userId", { status: 400 });

  const alarm: Alarm = await request.json();
  await env.DB
    .prepare(
      `INSERT INTO alarms (user_id, id, hour, minute, label, enabled, repeat, sound, sound_url, ai_text, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, id) DO UPDATE SET
         hour = excluded.hour,
         minute = excluded.minute,
         label = excluded.label,
         enabled = excluded.enabled,
         repeat = excluded.repeat,
         sound = excluded.sound,
         sound_url = excluded.sound_url,
         ai_text = excluded.ai_text,
         updated_at = excluded.updated_at`
    )
    .bind(
      userId,
      alarm.id,
      alarm.hour,
      alarm.minute,
      alarm.label ?? "",
      alarm.enabled ? 1 : 0,
      JSON.stringify(alarm.repeat),
      alarm.sound,
      alarm.soundUrl ?? null,
      alarm.aiText ?? null,
      Date.now()
    )
    .run();

  return Response.json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const id = url.searchParams.get("id");
  if (!userId || !id) return new Response("Missing userId or id", { status: 400 });

  await env.DB.prepare("DELETE FROM alarms WHERE user_id = ? AND id = ?").bind(userId, id).run();
  return Response.json({ ok: true });
};
