export interface PushEnv {
  GH_TOKEN?: string;
}

const REPO = "wrikka/wrikka-mobile";
const FILE = "ops/push-log.txt";

interface GitHubFile { content: string; sha: string; }
interface GitHubRef { object: { sha: string; }; }
interface GitHubCommit { tree: { sha: string; }; }
interface GitHubBlob { sha: string; }
interface GitHubTree { sha: string; }
interface GitHubCreatedCommit { sha: string; }

async function j<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}

function decodeBase64(str: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = str.replace(/\s/g, "");
  let out = "";
  for (let i = 0; i < clean.length; i += 4) {
    const a = chars.indexOf(clean[i]);
    const b = chars.indexOf(clean[i + 1]);
    const c = chars.indexOf(clean[i + 2]);
    const d = chars.indexOf(clean[i + 3]);
    const b1 = (a << 2) | (b >> 4);
    const b2 = ((b & 0x0f) << 4) | (c >> 2);
    const b3 = ((c & 0x03) << 6) | d;
    out += String.fromCharCode(b1);
    if (clean[i + 2] !== "=") out += String.fromCharCode(b2);
    if (clean[i + 3] !== "=") out += String.fromCharCode(b3);
  }
  return out;
}

async function getCurrentFile(token: string): Promise<{ content: string; sha: string; blobSha: string; } | null> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE}?ref=main`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub status ${res.status}`);
  const data = await j<GitHubFile>(res);
  return { content: decodeBase64(data.content), sha: data.sha, blobSha: data.sha };
}

async function createBlob(token: string, content: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/blobs`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
  const data = await j<GitHubBlob>(res);
  return data.sha;
}

async function getHeadSha(token: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
  });
  if (!res.ok) throw new Error(`GitHub status ${res.status}`);
  const data = await j<GitHubRef>(res);
  return data.object.sha;
}

async function getTreeSha(token: string, commitSha: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/commits/${commitSha}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
  });
  const data = await j<GitHubCommit>(res);
  return data.tree.sha;
}

async function createTree(token: string, baseTreeSha: string, path: string, blobSha: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/trees`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: [{ path, mode: "100644", type: "blob", sha: blobSha }],
    }),
  });
  const data = await j<GitHubTree>(res);
  return data.sha;
}

async function createCommit(token: string, message: string, treeSha: string, parentSha: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/commits`, {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
    body: JSON.stringify({ message, tree: treeSha, parents: [parentSha] }),
  });
  const data = await j<GitHubCreatedCommit>(res);
  return data.sha;
}

async function updateRef(token: string, commitSha: string): Promise<void> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/main`, {
    method: "PATCH",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wrikka-mobile" },
    body: JSON.stringify({ sha: commitSha }),
  });
  if (!res.ok) throw new Error(`GitHub update ref status ${res.status}`);
}

export async function handlePush(request: Request, env: PushEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  if (!env.GH_TOKEN) {
    return Response.json({ ok: false, error: "GitHub token not configured. Set GH_TOKEN as a Wrangler secret." });
  }

  try {
    const existing = await getCurrentFile(env.GH_TOKEN);
    const line = `Pushed at ${new Date().toISOString()}\n`;
    const newContent = existing ? existing.content + line : line;
    const blobSha = await createBlob(env.GH_TOKEN, newContent);

    const headSha = await getHeadSha(env.GH_TOKEN);
    const baseTreeSha = await getTreeSha(env.GH_TOKEN, headSha);
    const treeSha = await createTree(env.GH_TOKEN, baseTreeSha, FILE, blobSha);
    const commitSha = await createCommit(env.GH_TOKEN, `ops: push log update ${new Date().toISOString()}`, treeSha, headSha);
    await updateRef(env.GH_TOKEN, commitSha);

    return Response.json({ ok: true, message: "Pushed to GitHub", commitSha });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Push failed" });
  }
}
