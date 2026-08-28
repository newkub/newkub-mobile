export interface DeployEnv {
  GH_TOKEN?: string;
}

export async function handleDeploy(request: Request, env: DeployEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  if (!env.GH_TOKEN) {
    return Response.json({ ok: false, error: "GitHub token not configured. Set GH_TOKEN as a Wrangler secret." });
  }

  try {
    const res = await fetch("https://api.github.com/repos/newkub/newkub-mobile/actions/workflows/deploy.yml/dispatches", {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GH_TOKEN}`,
        "User-Agent": "newkub-mobile",
      },
      body: JSON.stringify({ ref: "main" }),
    });

    if (res.ok) {
      return Response.json({ ok: true, message: "Deploy workflow triggered on GitHub" });
    }

    const text = await res.text();
    return Response.json({ ok: false, error: `GitHub status ${res.status}: ${text}` });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Deploy request failed" });
  }
}
