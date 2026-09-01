export interface DevinEnv {
  DEVIN_API_KEY?: string;
  DEVIN_ORG_ID?: string;
}

const DEVIN_BASE = "https://api.devin.ai/v3";

export async function handleDevin(request: Request, env: DevinEnv): Promise<Response> {
  const url = new URL(request.url);
  const subPath = url.pathname.replace("/api/devin", "").replace(/^\//, "");

  const orgId = url.searchParams.get("org_id") || env.DEVIN_ORG_ID;
  if (!orgId) {
    return jsonError("Missing Devin org_id", 400);
  }
  if (!env.DEVIN_API_KEY) {
    return jsonError("Devin API key not configured", 500);
  }

  const devinUrl = `${DEVIN_BASE}/organizations/${orgId}/${subPath}${url.search ? `?${url.searchParams.toString()}` : ""}`;

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${env.DEVIN_API_KEY}`);
  // Devin API accepts JSON; strip host/content-length to avoid mismatch.
  headers.delete("host");
  headers.delete("content-length");

  try {
    const upstream = await fetch(devinUrl, {
      method: request.method,
      headers,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: responseHeaders });
    }

    return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: responseHeaders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Devin proxy error";
    return jsonError(message, 502);
  }
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
