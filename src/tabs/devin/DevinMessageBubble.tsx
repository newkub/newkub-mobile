import { createSignal, Show } from "solid-js";
import { generateSound } from "../../lib/elevenlabs";
import { playAlarmPreview, stopAudio } from "../../lib/audio";
import { appStore } from "../../store/app";
import type { DevinMessage } from "../../types";
import { haptic } from "../../lib/capacitor";
import { showStatus } from "../../lib/status";

function formatTime(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export function DevinMessageBubble(props: { message: DevinMessage }) {
  const [audio, setAudio] = createSignal<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = createSignal(false);
  const [loadingTts, setLoadingTts] = createSignal(false);

  const isUser = () => props.message.role === "user";

  async function speak() {
    if (!appStore.elevenLabsKey) {
      showStatus?.("Set ElevenLabs key in Settings to use TTS", "warning");
      return;
    }
    haptic("light");
    if (audio()) {
      stopAudio(audio());
      setAudio(null);
      setPlaying(false);
      return;
    }
    setLoadingTts(true);
    try {
      const url = await generateSound(props.message.content, appStore.elevenLabsKey);
      if (url) {
        const el = playAlarmPreview(url);
        el.onended = () => {
          setAudio(null);
          setPlaying(false);
        };
        setAudio(el);
        setPlaying(true);
      } else {
        showStatus?.("TTS failed", "error");
      }
    } catch {
      showStatus?.("TTS error", "error");
    } finally {
      setLoadingTts(false);
    }
  }

  return (
    <div class={`flex ${isUser() ? "justify-end" : "justify-start"}`}>
      <div
        class={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
          isUser() ? "bg-primary text-white" : "bg-surface-2 text-text"
        }`}
      >
        <p class="whitespace-pre-wrap">{props.message.content}</p>

        <Show when={props.message.attachments?.length}>
          <div class="mt-2 space-y-1">
            {props.message.attachments!.map((a) => (
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
        </Show>

        <div class="mt-1 flex items-center justify-end gap-2">
          <Show when={!isUser()}>
            <button
              onClick={speak}
              disabled={loadingTts()}
              class={`text-xs transition hover:text-primary ${playing() ? "text-primary" : "opacity-70"}`}
              aria-label={playing() ? "Stop speaking" : "Speak message"}
            >
              {loadingTts() ? (
                <span class="i-mdi-loading h-3.5 w-3.5 animate-spin" />
              ) : playing() ? (
                <span class="i-mdi-volume-high h-3.5 w-3.5" />
              ) : (
                <span class="i-mdi-volume-medium h-3.5 w-3.5" />
              )}
            </button>
          </Show>
          <p class="text-[10px] opacity-70">{formatTime(props.message.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
