import { Show } from "solid-js";
import { Button } from "../Button";
import { Input } from "../Input";
import { Switch } from "../Switch";

type SettingsDevinSectionProps = {
  org: string;
  setOrg: (v: string) => void;
  key: string;
  setKey: (v: string) => void;
  useProxy: boolean;
  setUseProxy: (v: boolean) => void;
  notifyDone: boolean;
  setNotifyDone: (v: boolean) => void;
  notifyWait: boolean;
  setNotifyWait: (v: boolean) => void;
  save: () => void;
};

export function SettingsDevinSection(props: SettingsDevinSectionProps) {
  return (
    <>
      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <h3 class="mb-3 font-semibold text-text">Devin API</h3>
        <label class="mb-4 flex items-center justify-between">
          <span class="text-sm text-text">Use Cloudflare Worker proxy</span>
          <Switch checked={props.useProxy} onChange={props.setUseProxy} aria-label="Use Cloudflare Worker proxy" />
        </label>
        <Input
          value={props.org}
          onChange={props.setOrg}
          label="Org ID"
          placeholder="org-..."
          class="mb-3"
        />
        <Show when={!props.useProxy}>
          <Input
            value={props.key}
            onChange={props.setKey}
            label="API Key"
            placeholder="cog-..."
          />
          <p class="mt-2 text-xs text-text-secondary">
            Stored locally. The proxy is recommended for security.
          </p>
        </Show>
      </div>

      <div class="rounded-2xl border border-border bg-surface-2 p-4">
        <h3 class="mb-3 font-semibold text-text">Notifications</h3>
        <label class="mb-3 flex items-center justify-between">
          <span class="text-sm text-text">When completed</span>
          <Switch checked={props.notifyDone} onChange={props.setNotifyDone} aria-label="Notify when Devin session completes" />
        </label>
        <label class="flex items-center justify-between">
          <span class="text-sm text-text">When waiting for input</span>
          <Switch checked={props.notifyWait} onChange={props.setNotifyWait} aria-label="Notify when Devin is waiting for input" />
        </label>
      </div>

      <Button onClick={props.save} class="w-full" aria-label="Save Devin settings">
        Save Devin settings
      </Button>
    </>
  );
}
