export interface WorkerStatus {
  name: string;
  url: string;
  dashboard: string;
  status: string;
}

export async function fetchWorkerStatus(): Promise<WorkerStatus> {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.worker as WorkerStatus;
  } catch (err) {
    return {
      name: "wrikka-mobile",
      url: "https://wrikka-mobile.workers.dev",
      dashboard: "https://dash.cloudflare.com/",
      status: err instanceof Error ? err.message : "unknown",
    };
  }
}
