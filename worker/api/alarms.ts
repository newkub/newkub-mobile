import type { Alarm } from "../../src/types";

export interface AlarmsEnv {
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

function getUserId(url: URL): string | null {
  return url.searchParams.get("userId");
}

export async function getAlarms(request: Request, env: AlarmsEnv): Promise<Response> {
  const url = new URL(request.url);
  const userId = getUserId(url);
  if (!userId) return missingUserId();

  const { results } = await env.DB
    .prepare("SELECT * FROM alarms WHERE user_id = ? ORDER BY hour, minute")
    .bind(userId)
    .all();

  return Response.json(rowsToAlarms(results ?? []));
}

export async function postAlarm(request: Request, env: AlarmsEnv): Promise<Response> {
  const url = new URL(request.url);
  const userId = getUserId(url);
  if (!userId) return missingUserId();

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
}

export async function deleteAlarm(request: Request, env: AlarmsEnv): Promise<Response> {
  const url = new URL(request.url);
  const userId = getUserId(url);
  const id = url.searchParams.get("id");
  if (!userId || !id) return missingParams();

  await env.DB.prepare("DELETE FROM alarms WHERE user_id = ? AND id = ?").bind(userId, id).run();
  return Response.json({ ok: true });
}

function missingUserId() {
  return new Response(JSON.stringify({ error: "Missing userId" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

function missingParams() {
  return new Response(JSON.stringify({ error: "Missing userId or id" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
