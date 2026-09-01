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
import { DevinMessageBubble } from "./DevinMessageBubble";
import { DevinChatInput } from "./DevinChatInput";
import { DevinQuestionCard } from "./DevinQuestionCard";
import type { DevinMessage, DevinSession, DevinStatusDetail } from "../../types";
import { appStore, setActiveDevinSessionId } from "../../store/app";
import { showLocalNotification } from "../../lib/notifications";

export function DevinChat(props: {
  session: DevinSession;
  onBack: () => void;
  onArchive?: () => void;
}) {
  const [session, setSession] = createSignal<DevinSession>(props.session);
  const [messages, setMessages] = createSignal<DevinMessage[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [sending, setSending] = createSignal(false);
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
    setActiveDevinSessionId(props.session.session_id);
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

  onCleanup(() => {
    controller.abort();
    setActiveDevinSessionId(null);
  });

  createEffect(() => {
    if (scrollRef) scrollRef.scrollTop = scrollRef.scrollHeight;
  });

  async function send(text: string, attachmentUrls: string[] = []) {
    if ((!text.trim() && !attachmentUrls.length) || sending()) return;
    haptic("light");
    setSending(true);
    try {
      await sendDevinMessage(session().session_id, text, attachmentUrls);
      setWaiting(null);
      const { messages: list } = await listDevinMessages(session().session_id, 100);
      setMessages(list);
    } catch (err) {
      showStatus(err instanceof Error ? err.message : "Failed to send", "error");
    } finally {
      setSending(false);
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
            class="rounded-full p-2 text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
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
            class="rounded-full p-2 text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
            aria-label="Open in web"
          >
            <span class="i-mdi-open-in-new h-5 w-5" />
          </button>
          <button
            onClick={archive}
            class="rounded-full p-2 text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
            aria-label="Archive session"
          >
            <span class="i-mdi-archive h-5 w-5" />
          </button>
          <button
            onClick={terminate}
            class="rounded-full p-2 text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-danger"
            aria-label="Terminate session"
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
          <div class="space-y-2 p-2" aria-busy="true" aria-label="Loading messages">
            <For each={[1, 2, 3]}>
              {() => <div class="skeleton h-16 w-full" aria-busy="true" aria-label="Loading" />}
            </For>
          </div>
        </Show>

        <For each={messages()}>
          {(msg) => <DevinMessageBubble message={msg} />}
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

      <DevinChatInput onSend={send} disabled={sending()} />
    </div>
  );
}
