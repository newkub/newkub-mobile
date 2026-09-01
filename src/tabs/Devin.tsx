import { createSignal, Show } from "solid-js";
import { appStore, setDevinSettings } from "../store/app";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Switch } from "../components/Switch";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";
import { DevinSessionList } from "./devin/DevinSessionList";
import { DevinNewSession } from "./devin/DevinNewSession";
import { DevinChat } from "./devin/DevinChat";
import type { DevinSession } from "../types";

type View = "list" | "new" | "chat";

export function DevinTab() {
  const [view, setView] = createSignal<View>("list");
  const [activeSession, setActiveSession] = createSignal<DevinSession | null>(null);

  const cfg = () => appStore.devinSettings;
  const configured = () =>
    cfg().useProxy || (cfg().orgId.trim() !== "" && cfg().apiKey.trim() !== "");

  function openChat(session: DevinSession) {
    haptic("light");
    setActiveSession(session);
    setView("chat");
  }

  function newSession() {
    haptic("light");
    setView("new");
  }

  function onCreated(session: DevinSession) {
    setActiveSession(session);
    setView("chat");
  }

  return (
    <div class="h-full">
      <Show when={!configured()} fallback={<DevinViews view={view()} onNew={newSession} onSelect={openChat} onCreated={onCreated} session={activeSession()} back={() => setView("list")} />}>
        <DevinOnboarding />
      </Show>
    </div>
  );
}

function DevinOnboarding() {
  const cfg = () => appStore.devinSettings;
  const [org, setOrg] = createSignal(cfg().orgId);
  const [key, setKey] = createSignal(cfg().apiKey);
  const [proxy, setProxy] = createSignal(cfg().useProxy);

  function save() {
    haptic("success");
    setDevinSettings({
      orgId: org().trim(),
      apiKey: key().trim(),
      useProxy: proxy(),
    });
    showStatus("Devin settings saved", "success");
  }

  return (
    <div class="flex h-full flex-col gap-4 px-4">
      <div class="mb-2 rounded-2xl bg-surface-2 p-4 text-center">
        <span class="i-mdi-robot mx-auto mb-2 h-10 w-10 text-primary" />
        <h2 class="text-lg font-bold text-text">Connect Devin</h2>
        <p class="text-sm text-text-secondary">
          Use your org ID and API key, or enable the Cloudflare proxy.
        </p>
      </div>

      <label class="flex items-center justify-between rounded-2xl bg-surface-2 p-3">
        <span class="text-sm text-text">Use Cloudflare Worker proxy</span>
        <Switch checked={proxy()} onChange={setProxy} />
      </label>

      <Input
        value={org()}
        onChange={setOrg}
        label="Devin Org ID"
        placeholder="org-..."
      />

      <Show when={!proxy()}>
        <Input
          value={key()}
          onChange={setKey}
          label="Devin API Key"
          placeholder="cog-..."
        />
        <p class="text-xs text-text-secondary">
          Stored locally. Recommended to use the proxy instead.
        </p>
      </Show>

      <div class="mt-auto">
        <Button onClick={save} class="w-full">
          Save settings
        </Button>
      </div>
    </div>
  );
}

interface DevinViewsProps {
  view: View;
  onNew: () => void;
  onSelect: (s: DevinSession) => void;
  onCreated: (s: DevinSession) => void;
  session: DevinSession | null;
  back: () => void;
}

function DevinViews(props: DevinViewsProps) {
  return (
    <>
      {props.view === "list" && (
        <DevinSessionList onNew={props.onNew} onSelect={props.onSelect} />
      )}
      {props.view === "new" && (
        <DevinNewSession onCreated={props.onCreated} onCancel={props.back} />
      )}
      {props.view === "chat" && props.session && (
        <DevinChat
          session={props.session}
          onBack={props.back}
          onArchive={props.back}
        />
      )}
    </>
  );
}
