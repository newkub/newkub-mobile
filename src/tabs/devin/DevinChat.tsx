import { createEffect, createSignal, For, onCleanup, onMount, Show } from "solid-js";
import {
  archiveDevinSession,
  getDevinSession,
  isWaitingForUser,
  listDevinMessages,
  pollDevinSession,
  sendDevinMessage,
  terminateDevinSession,
} from "../../lib/devin";
import { showStatus } from "../../lib/status";
import { haptic } from "../../lib/capacitor";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { DevinQuestionCard } from "./DevinQuestionCard";
import type { DevinMessage, DevinSession, DevinStatusDetail } from "../../types";
import { appStore } from "../../store/app";
import { showLocalNotification } from "../../lib/notifications";

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export function DevinChat(props: {
  session: DevinSession;
  onBack: () => void;
  onArchive?: () => void;
}) {
  const [session, setSession] = createSignal<DevinSession>(props.session);
  const [messages, setMessages] = createSignal<DevinMessage[]>([]);
  const [input, setInput] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [waiting, setWaiting] = createSignal<DevinStatusDetail | null>(null);
  const [error, setError] = createSignal<string | null>(null);

  let scrollRef: HTMLDivElement | undefined;
  const controller = new AbortController();

  async function loadInitial() {
    setLoading(true);
    try {
      const [s, { messages: list }] = await Promise.all([
        getDevinSession(props.session.session_id),
        listDevinMessages(props.session.session_id, 100),
      ]);
      setSession(s);
      setMessages(list);
      if (s.status_detail && isWaitingForUser(s.status_detail)) {
        setWaiting(s.status_detail);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    } finally {
      setLoading(false);
    }
  }

  onMount(() => {
    loadInitial();
    pollDevinSession(
      props.session.session_id,
      {
        onSession: (s) => {
          setSession(s);
          if (s.status_detail && isWaitingForUser(s.status_detail)) {
            setWaiting(s.status_detail);
            if (appStore.devinSettings.notifyWaiting) {
              showLocalNotification("Devin needs input", s.title || props.session.session_id);
            }
          } else {
            setWaiting(null);
          }
        },
        onMessages: (list) => {
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.id));
            const added = list.filter((m) => !existing.has(m.id));
            return [...prev, ...added];
          });
        },
        onDone: (s) => {
          setSession(s);
          if (appStore.devinSettings.notifyCompleted) {
            showLocalNotification("Devin session done", s.title || s.session_id);
          }
        },
        onError: (err) => setError(err.message),
      },
      controller.signal,
    );
  });

  onCleanup(() => controller.abort());

  createEffect(() => {
    if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
  });

  async function send(text: string) {
    if (!text.trim() || loading()) return;
    haptic("light");
    setLoading(true);
    try {
      await sendDevinMessage(session().session_id, text);
      setInput("");
      setWaiting(null);
      const { messages: list } = await listDevinMessages(session().session_id, 100);
      setMessages(list);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setLoading(false);
    }
  }

  async function archive() {
    haptic("medium");
    try {
      const s = await archiveDevinSession(session().session_id);
      setSession(s);
      props.onArchive?.();
      showStatus("Session archived", "success");
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Archive failed", "error");
    }
  }

  async function terminate() {
    haptic("medium");
    try {
      const s = await terminateDevinSession(session().session_id, true);
      setSession(s);
      showStatus("Session terminated and archived", "success");
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Terminate failed", "error");
    }
  }

  function openWeb() {
    const url = session().url;
    if (!url) {
      showStatus("No session URL", "warning");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function statusLabel() {
    const s = session();
    if (s.is_archived) return "archived";
    if (s.status_detail) return s.status_detail.replace(/_/g, " ");
    return s.status;
  }

  return (
    <div class="flex h-full flex-col px-4">
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <button
            onClick={props.onBack}
            class="rounded-full p-2 text-text-secondary transition hover:text-text"
            aria-label="Back"
          >
            <span class="i-mdi-arrow-left h-5 w-5" />
          </button>
          <div class="min-w-0">
            <h2 class="truncate text-base font-bold text-text">
              {session().title || session().session_id}
            </h2>
            <p class={`text-xs ${session().status === "error" ? "text-danger" : "text-text-secondary"}`}>
              {statusLabel()}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <button
            onClick={openWeb}
            class="rounded-full p-2 text-text-secondary transition hover:text-text"
            aria-label="Open in web"
          >
            <span class="i-mdi-open-in-new h-5 w-5" />
          </button>
          <button
            onClick={archive}
            class="rounded-full p-2 text-text-secondary transition hover:text-text"
            aria-label="Archive"
          >
            <span class="i-mdi-archive h-5 w-5" />
          </button>
          <button
            onClick={terminate}
            class="rounded-full p-2 text-text-secondary transition hover:text-danger"
            aria-label="Terminate"
          >
            <span class="i-mdi-stop-circle h-5 w-5" />
          </button>
        </div>
      </div>

      <Show when={error()}>
        <div class="mb-3 rounded-2xl bg-danger/10 p-3 text-sm text-danger">
          {error()}
        </div>
      </Show>

      <div
        ref={(el) => { scrollRef = el; }}
        class="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-surface p-3"
      >
        <Show when={loading() && messages().length === 0}>
          <div class="space-y-2 p-2">
            <For each={[1, 2, 3]}>
              {() => (
                <div class="h-16 animate-pulse rounded-2xl bg-surface-2" />
              )}
            </For>
          </div>
        </Show>

        <For each={messages()}>
          {(msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                class={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  class={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    isUser
                      ? "bg-primary text-white"
                      : "bg-surface-2 text-text"
                  }`}
                >
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                  {msg.attachments?.length ? (
                    <div class="mt-2 space-y-1">
                      {msg.attachments.map((a) => (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          class="block truncate text-xs underline opacity-80"
                        >
                          {a.url}
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <p class="mt-1 text-right text-[10px] opacity-70">
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <Show when={waiting()}>
        <div class="mt-3">
          <DevinQuestionCard
            detail={waiting()!}
            onAnswer={(text) => send(text)}
          />
        </div>
      </Show>

      <div class="mt-3 flex items-end gap-2 pb-2">
        <Input
          value={input()}
          onChange={setInput}
          placeholder="Type a message..."
          class="flex-1"
        />
        <Button onClick={() => send(input())} disabled={loading()} size="md" class="shrink-0">
          <span class="i-mdi-send h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
