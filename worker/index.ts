import type { AlarmsEnv } from "./api/alarms";
import { getAlarms, postAlarm, deleteAlarm } from "./api/alarms";
import type { RemindersEnv } from "./api/reminders";
import { getReminders, postReminder, deleteReminder } from "./api/reminders";
import { handleStatus } from "./api/status";
import { handleAiFix } from "./api/ai-fix";
import { handleDeploy } from "./api/deploy";
import { handlePush } from "./api/push";

export interface Env extends AlarmsEnv, RemindersEnv {
  ASSETS: Fetcher;
  OPENAI_API_KEY?: string;
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
  GH_TOKEN?: string;
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

      if (url.pathname === "/api/deploy") {
        return await handleDeploy(request, env);
      }

      if (url.pathname === "/api/push") {
        return await handlePush(request, env);
      }

      // Static assets with cache-busting headers
      const assetRes = await env.ASSETS.fetch(request);
      const headers = new Headers(assetRes.headers);

      if (url.pathname === "/" || url.pathname === "/index.html") {
        headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        headers.set("Pragma", "no-cache");
        headers.set("Expires", "0");
        headers.set("CDN-Cache-Control", "no-store");
      } else if (url.pathname === "/sw.js" || url.pathname === "/manifest.webmanifest" || url.pathname === "/privacy-policy.html") {
        headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.set("CDN-Cache-Control", "no-store");
      } else if (url.pathname.startsWith("/assets/")) {
        if (!headers.has("Cache-Control")) {
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
        }
      }

      return new Response(assetRes.body, {
        status: assetRes.status,
        statusText: assetRes.statusText,
        headers,
      });
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
