import type { DevinMessage, DevinSession, DevinSettings, DevinStatusDetail } from "../types";
import { appStore } from "../store/app";

const DEVIN_BASE = "https://api.devin.ai/v3";

function baseUrl(): string {
  const cfg = appStore.devinSettings;
  if (cfg?.useProxy) return "/api/devin";
  return `${DEVIN_BASE}/organizations/${cfg?.orgId || ""}`;
}

function headers(): Record<string, string> {
  const cfg = appStore.devinSettings;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (!cfg?.useProxy && cfg?.apiKey) {
    h.Authorization = `Bearer ${cfg.apiKey}`;
  }
  return h;
}

export class DevinError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "DevinError";
  }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { ...headers(), ...(init?.headers || {}) } });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new DevinError(text || `HTTP ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

interface Paginated<T> {
  data: T[];
  pageInfo?: { endCursor?: string | null; hasNextPage?: boolean } | null;
}

interface SessionCreateBody {
  prompt: string;
  devin_mode?: string;
  title?: string;
  origin?: string;
}

export async function listDevinSessions(
  first = 50,
  after?: string,
): Promise<{ sessions: DevinSession[]; endCursor?: string | null }> {
  const params = new URLSearchParams({ first: String(first) });
  if (after) params.set("after", after);
  const url = `${baseUrl()}/sessions?${params.toString()}`;
  const json = await fetchJson<Paginated<DevinSession>>(url);
  return { sessions: json.data || [], endCursor: json.pageInfo?.endCursor };
}

export async function getDevinSession(id: string): Promise<DevinSession> {
  return fetchJson<DevinSession>(`${baseUrl()}/sessions/${id}`);
}

export async function createDevinSession(
  prompt: string,
  options?: { devin_mode?: string; title?: string },
): Promise<DevinSession> {
  const body: SessionCreateBody = { prompt, origin: "other" };
  if (options?.devin_mode) body.devin_mode = options.devin_mode;
  if (options?.title) body.title = options.title;
  return fetchJson<DevinSession>(`${baseUrl()}/sessions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listDevinMessages(
  id: string,
  first = 100,
  after?: string,
): Promise<{ messages: DevinMessage[]; endCursor?: string | null }> {
  const params = new URLSearchParams({ first: String(first) });
  if (after) params.set("after", after);
  const url = `${baseUrl()}/sessions/${id}/messages?${params.toString()}`;
  const json = await fetchJson<Paginated<DevinMessage>>(url);
  return { messages: json.data || [], endCursor: json.pageInfo?.endCursor };
}

export async function sendDevinMessage(id: string, message: string): Promise<DevinSession> {
  return fetchJson<DevinSession>(`${baseUrl()}/sessions/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function archiveDevinSession(id: string): Promise<DevinSession> {
  return fetchJson<DevinSession>(`${baseUrl()}/sessions/${id}/archive`, {
    method: "POST",
  });
}

export async function terminateDevinSession(id: string, archive = false): Promise<DevinSession> {
  const params = new URLSearchParams();
  if (archive) params.set("archive", "true");
  const url = `${baseUrl()}/sessions/${id}${params.toString() ? `?${params.toString()}` : ""}`;
  return fetchJson<DevinSession>(url, { method: "DELETE" });
}

export function isTerminalStatus(status: DevinSession["status"]): boolean {
  return status === "exit" || status === "error";
}

export function isWaitingForUser(detail?: DevinStatusDetail | null): boolean {
  return detail === "waiting_for_user" || detail === "waiting_for_approval";
}

export interface PollCallbacks {
  onSession?: (session: DevinSession) => void;
  onMessages?: (messages: DevinMessage[]) => void;
  onWaiting?: (detail: DevinStatusDetail) => void;
  onDone?: (session: DevinSession) => void;
  onError?: (err: DevinError) => void;
}

export async function pollDevinSession(
  id: string,
  callbacks: PollCallbacks,
  signal?: AbortSignal,
): Promise<void> {
  let delay = 2000;
  let lastMessageId = "";

  while (!signal?.aborted) {
    try {
      const [session, { messages }] = await Promise.all([
        getDevinSession(id),
        listDevinMessages(id, 100, lastMessageId || undefined),
      ]);

      callbacks.onSession?.(session);

      if (messages.length) {
        callbacks.onMessages?.(messages);
        const last = messages[messages.length - 1];
        if (last?.id) lastMessageId = last.id;
      }

      if (session.status_detail && isWaitingForUser(session.status_detail)) {
        callbacks.onWaiting?.(session.status_detail);
      }

      if (isTerminalStatus(session.status) || session.is_archived) {
        callbacks.onDone?.(session);
        return;
      }

      delay = Math.min(delay + 1000, 10000);
    } catch (err) {
      const devinErr = err instanceof DevinError ? err : new DevinError(String(err));
      callbacks.onError?.(devinErr);
      delay = Math.min(delay + 2000, 30000);
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export { DevinSettings };
