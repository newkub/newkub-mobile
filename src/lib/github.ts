export interface RepoStatus {
  name: string;
  url: string;
  pushedAt: string | null;
  updatedAt: string | null;
  defaultBranch: string;
  error: string | null;
}

export async function fetchRepoStatus(repo = "newkub/newkub-mobile"): Promise<RepoStatus> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "newkub-mobile" },
    });
    if (!res.ok) {
      return { name: repo, url: `https://github.com/${repo}`, pushedAt: null, updatedAt: null, defaultBranch: "main", error: `GitHub status ${res.status}` };
    }
    const data = await res.json();
    return {
      name: repo,
      url: `https://github.com/${repo}`,
      pushedAt: data.pushed_at ?? null,
      updatedAt: data.updated_at ?? null,
      defaultBranch: data.default_branch ?? "main",
      error: null,
    };
  } catch (err) {
    return { name: repo, url: `https://github.com/${repo}`, pushedAt: null, updatedAt: null, defaultBranch: "main", error: err instanceof Error ? err.message : "GitHub fetch failed" };
  }
}
