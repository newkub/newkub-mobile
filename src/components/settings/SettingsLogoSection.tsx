import { Button } from "../Button";
import { setGlobalSetting } from "../../store/app";
import { showStatus } from "../../lib/status";

export function SettingsLogoSection() {
  return (
    <div class="rounded-2xl border border-border bg-surface-2 p-4 text-center">
      <img src="/logo.svg" alt="App logo" class="mx-auto mb-4 h-24 w-24 rounded-3xl" />
      <p class="text-sm text-text-secondary">Current logo</p>
      <p class="mt-2 text-xs text-muted">Logo customization by URL coming soon.</p>
      <Button
        onClick={() => {
          setGlobalSetting("customLogo", "default");
          showStatus("Logo reset to default", "success");
        }}
        class="mt-3 w-full"
        aria-label="Reset logo to default"
      >
        Use default logo
      </Button>
    </div>
  );
}
