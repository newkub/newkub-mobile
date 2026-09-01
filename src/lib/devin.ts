import type { DevinMessage, DevinSession, DevinSettings, DevinStatusDetail } from "../types";
import { appStore, type TabDefinition } from "../store/app";
import { showLocalNotification } from "./notifications";

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

interface StructuredOutput {
  type: "json_schema";
  json_schema: {
    name: string;
    schema: Record<string, unknown>;
  };
}

interface SessionCreateBody {
  prompt: string;
  devin_mode?: string;
  title?: string;
  origin?: string;
  structured_output?: StructuredOutput;
  attachment_urls?: string[];
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

export interface CreateSessionOptions {
  devin_mode?: string;
  title?: string;
  structured_output?: StructuredOutput;
  attachment_urls?: string[];
}

export async function createDevinSession(
  prompt: string,
  options?: CreateSessionOptions,
): Promise<DevinSession> {
  const body: SessionCreateBody = { prompt, origin: "other" };
  if (options?.devin_mode) body.devin_mode = options.devin_mode;
  if (options?.title) body.title = options.title;
  if (options?.structured_output) body.structured_output = options.structured_output;
  if (options?.attachment_urls?.length) body.attachment_urls = options.attachment_urls;
  return fetchJson<DevinSession>(`${baseUrl()}/sessions`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const tabDefinitionSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    id: { type: "string" },
    label: { type: "string" },
    icon: { type: "string", description: "Icon class, prefer i-mdi-* prefix" },
    type: { type: "string", enum: ["custom"] },
    visible: { type: "boolean" },
  },
  required: ["id", "label", "icon", "type", "visible"],
};

export async function createDevinTabDefinition(prompt: string): Promise<DevinSession> {
  const fullPrompt = `Design a tab for this mobile app and return ONLY a JSON object matching the schema. User request: ${prompt}`;
  return createDevinSession(fullPrompt, {
    title: `Tab: ${prompt.slice(0, 30)}`,
    structured_output: {
      type: "json_schema",
      json_schema: { name: "tab_definition", schema: tabDefinitionSchema },
    },
  });
}

export async function getDevinTabResult(sessionId: string): Promise<TabDefinition | null> {
  const { messages } = await listDevinMessages(sessionId, 100);
  const last = messages.filter((m) => m.role === "assistant").pop();
  if (!last) return null;
  try {
    const parsed = JSON.parse(last.content) as Partial<TabDefinition>;
    if (!parsed.id || !parsed.label || !parsed.icon) return null;
    return {
      id: parsed.id,
      label: parsed.label,
      icon: parsed.icon,
      type: parsed.type || "custom",
      visible: parsed.visible ?? true,
    } as TabDefinition;
  } catch {
    return null;
  }
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

export async function sendDevinMessage(
  id: string,
  message: string,
  attachmentUrls?: string[],
): Promise<DevinSession> {
  const body: { message: string; attachment_urls?: string[] } = { message };
  if (attachmentUrls?.length) body.attachment_urls = attachmentUrls;
  return fetchJson<DevinSession>(`${baseUrl()}/sessions/${id}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
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

export async function requestAiFix(input: { query: string; codeSnippet?: string }): Promise<string> {
  const res = await fetch("/api/ai-fix", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: input.query, code: input.codeSnippet }),
  });
  const json = (await res.json()) as { suggestion?: string; ok?: boolean; error?: string };
  if (!res.ok || !json.ok) {
    throw new DevinError(json.error || `HTTP ${res.status}`, res.status);
  }
  return json.suggestion || "No suggestion returned";
}

let lastNotifiedStatus = "";
let lastNotifiedDetail = "";

export async function checkAndNotifyDevinSession(id: string): Promise<void> {
  try {
    const session = await getDevinSession(id);
    const statusChanged =
      session.status !== lastNotifiedStatus ||
      (session.status_detail ?? "") !== lastNotifiedDetail;

    if (!statusChanged) return;

    lastNotifiedStatus = session.status;
    lastNotifiedDetail = session.status_detail ?? "";

    if (session.status_detail && isWaitingForUser(session.status_detail)) {
      if (appStore.devinSettings.notifyWaiting) {
        showLocalNotification("Devin needs input", session.title || id);
      }
    }

    if (isTerminalStatus(session.status) || session.is_archived) {
      if (appStore.devinSettings.notifyCompleted) {
        showLocalNotification("Devin session done", session.title || id);
      }
    }
  } catch {
    // ignore network errors on resume
  }
}
