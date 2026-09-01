import { createSignal, For, Show } from "solid-js";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { haptic } from "../../lib/capacitor";

interface DevinChatInputProps {
  onSend: (message: string, attachmentUrls: string[]) => void;
  disabled?: boolean;
}

export function DevinChatInput(props: DevinChatInputProps) {
  const [text, setText] = createSignal("");
  const [attachmentUrls, setAttachmentUrls] = createSignal<string[]>([]);
  const [showAttach, setShowAttach] = createSignal(false);
  const [newUrl, setNewUrl] = createSignal("");

  function addUrl() {
    const url = newUrl().trim();
    if (!url) return;
    try {
      new URL(url);
      haptic("light");
      setAttachmentUrls([...attachmentUrls(), url]);
      setNewUrl("");
    } catch {
      haptic("error");
    }
  }

  function removeUrl(url: string) {
    haptic("light");
    setAttachmentUrls(attachmentUrls().filter((u) => u !== url));
  }

  function send() {
    const message = text().trim();
    if (!message && attachmentUrls().length === 0) return;
    props.onSend(message, attachmentUrls());
    setText("");
    setAttachmentUrls([]);
    setShowAttach(false);
  }

  return (
    <div class="mt-3 rounded-2xl border border-border bg-surface-2 p-2 pb-2">
      <Show when={attachmentUrls().length > 0}>
        <div class="mb-2 flex flex-wrap gap-2">
          <For each={attachmentUrls()}>
            {(url) => (
              <div class="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                <span class="i-mdi-attachment h-3 w-3" />
                <span class="max-w-[120px] truncate">{url}</span>
                <button onClick={() => removeUrl(url)} class="ml-1">
                  <span class="i-mdi-close h-3 w-3" />
                </button>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={showAttach()}>
        <div class="mb-2 flex items-end gap-2">
          <Input
            value={newUrl()}
            onChange={setNewUrl}
            placeholder="Paste image or file URL..."
            class="flex-1"
          />
          <Button onClick={addUrl} size="sm">
            Add
          </Button>
        </div>
      </Show>

      <div class="flex items-end gap-2">
        <button
          onClick={() => { haptic("light"); setShowAttach(!showAttach()); }}
          class="rounded-full p-2 text-text-secondary transition hover:text-text"
          aria-label="Attach file URL"
        >
          <span class="i-mdi-attachment h-5 w-5" />
        </button>
        <Input
          value={text()}
          onChange={setText}
          placeholder="Type a message..."
          class="flex-1"
        />
        <Button onClick={send} disabled={props.disabled} size="md" class="shrink-0">
          <span class="i-mdi-send h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
