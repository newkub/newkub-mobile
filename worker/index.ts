import type { AlarmsEnv } from "./api/alarms";
import { getAlarms, postAlarm, deleteAlarm } from "./api/alarms";
import type { RemindersEnv } from "./api/reminders";
import { getReminders, postReminder, deleteReminder } from "./api/reminders";
import { handleStatus } from "./api/status";
import { handleAiFix } from "./api/ai-fix";

export interface Env extends AlarmsEnv, RemindersEnv {
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/alarms") {
        if (request.method === "GET") return await getAlarms(request, env);
        if (request.method === "POST") return await postAlarm(request, env);
        return methodNotAllowed();
      }

      if (url.pathname === "/api/reminders") {
        if (request.method === "GET") return await getReminders(request, env);
        if (request.method === "POST") return await postReminder(request, env);
        return methodNotAllowed();
      }

      if (url.pathname === "/api/status") {
        return await handleStatus(request, env);
      }

      if (url.pathname === "/api/ai-fix") {
        return await handleAiFix(request, env);
      }

      // Static assets
      return env.ASSETS.fetch(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

function methodNotAllowed() {
  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json" },
  });
}
