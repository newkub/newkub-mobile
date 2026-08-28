export interface StatusEnv {
  CF_ACCOUNT_ID?: string;
  CF_API_TOKEN?: string;
}

export async function handleStatus(request: Request, env: StatusEnv): Promise<Response> {
  const url = new URL(request.url);
  const repo = url.searchParams.get("repo") ?? "newkub/newkub-mobile";
  const [owner, name] = repo.split("/");

  let repoData: Record<string, unknown> | null = null;
  let repoError: string | null = null;

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${name}`, {
      headers: { "Accept": "application/vnd.github+json", "User-Agent": "newkub-mobile" },
    });
    if (res.ok) {
      repoData = await res.json();
    } else {
      repoError = `GitHub status ${res.status}`;
    }
  } catch (err) {
    repoError = err instanceof Error ? err.message : "GitHub fetch failed";
  }

  let cloudflareStatus = "unknown";
  let cloudflareUrl = "https://dash.cloudflare.com/";

  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) {
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/services/newkub-mobile`,
        { headers: { Authorization: `Bearer ${env.CF_API_TOKEN}` } }
      );
      cloudflareStatus = res.ok ? "healthy" : `error ${res.status}`;
      if (res.ok) cloudflareUrl = `https://dash.cloudflare.com/?to=/:account/workers-and-pages/newkub-mobile`;
    } catch (err) {
      cloudflareStatus = err instanceof Error ? err.message : "Cloudflare fetch failed";
    }
  } else {
    cloudflareStatus = "no-token";
  }

  return Response.json({
    repo: {
      name: repo,
      url: `https://github.com/${repo}`,
      pushedAt: repoData?.pushed_at ?? null,
      updatedAt: repoData?.updated_at ?? null,
      defaultBranch: repoData?.default_branch ?? "main",
      error: repoError,
    },
    worker: {
      name: "new-habbit",
      url: `https://new-habbit.works.dev`, // placeholder; actual domain from deploy
      dashboard: cloudflareUrl,
      status: cloudflareStatus,
    },
    cloudflare: {
      status: "operational",
      statusUrl: "https://www.cloudflarestatus.com/",
    },
  });
}
