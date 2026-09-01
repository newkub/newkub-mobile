import { createSignal, Show } from "solid-js";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { haptic } from "../../lib/capacitor";
import type { DevinStatusDetail } from "../../types";

interface DevinQuestionCardProps {
  detail: DevinStatusDetail;
  onAnswer: (text: string) => void;
}

export function DevinQuestionCard(props: DevinQuestionCardProps) {
  const [text, setText] = createSignal("");

  function send() {
    const v = text().trim();
    if (!v) return;
    haptic("light");
    props.onAnswer(v);
    setText("");
  }

  function quick(answer: string) {
    haptic("light");
    props.onAnswer(answer);
  }

  const isApproval = () =>
    props.detail === "waiting_for_approval";

  return (
    <div class="rounded-2xl border-2 border-primary/30 bg-surface-2 p-4">
      <h3 class="mb-3 text-sm font-bold text-primary">Devin is asking</h3>

      <Show when={isApproval()}>
        <div class="mb-3 flex gap-2">
          <Button onClick={() => quick("Approve")} size="sm" class="flex-1">
            Approve
          </Button>
          <Button onClick={() => quick("Decline")} variant="secondary" size="sm" class="flex-1">
            Decline
          </Button>
        </div>
      </Show>

      <div class="flex items-end gap-2">
        <Input
          value={text()}
          onChange={setText}
          placeholder={isApproval() ? "Add a note (optional)" : "Type your answer..."}
          class="flex-1"
        />
        <Button onClick={send} size="sm" class="shrink-0">
          <span class="i-mdi-send h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
