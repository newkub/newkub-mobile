export interface AiFixEnv {
  OPENAI_API_KEY?: string;
}

export async function handleAiFix(request: Request, env: AiFixEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error, code, stack } = await request.json<{ error?: string; code?: string; stack?: string }>();
  if (!error) {
    return new Response(JSON.stringify({ error: "Missing error message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // If an OpenAI API key is configured, call it for a real suggestion.
  if (env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Given an error and optional code, return a concise suggestion to fix it.",
            },
            {
              role: "user",
              content: `Error: ${error}\n\nStack: ${stack ?? "unknown"}\n\nCode:\n${code ?? ""}`,
            },
          ],
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json<{ choices?: { message?: { content?: string } }[] }>();
        const suggestion = data.choices?.[0]?.message?.content?.trim();
        if (suggestion) {
          return Response.json({ ok: true, suggestion, source: "openai" });
        }
      }
    } catch {
      // fall through to local fallback
    }
  }

  // Local fallback: classify and return a deterministic suggestion.
  const suggestion = localSuggestion(error, stack);

  return Response.json({
    ok: true,
    suggestion,
    source: "local",
  });
}

function localSuggestion(error: string, stack?: string): string {
  const text = `${error} ${stack ?? ""}`.toLowerCase();

  if (text.includes("notification") || text.includes("localnotifications")) {
    return "ตรวจสอบ permission notifications ใน Settings และ on Android ให้ขอ `SCHEDULE_EXACT_ALARM` ใน `AndroidManifest.xml`";
  }
  if (text.includes("d1") || text.includes("database")) {
    return "ตรวจสอบ D1 database_id ใน wrangler.toml และให้รัน schema.sql ก่อน deploy";
  }
  if (text.includes("fetch") || text.includes("network")) {
    return "ตรวจสอบ network, CORS, CSP headers และ worker endpoint URL";
  }
  if (text.includes("type") || text.includes("typescript")) {
    return "รัน `bun typecheck` แล้วแก้ type errors";
  }
  if (text.includes("build") || text.includes("vite")) {
    return "รัน `bun run build` ดู error log, ตรวจสอบ Vite config และ worker entry";
  }
  return "ลองรัน `bun run build` และ `bun typecheck` ใหม่ หรือกดปุ่ม AI Fix เพื่อส่ง error log ให้ analyze";
}
