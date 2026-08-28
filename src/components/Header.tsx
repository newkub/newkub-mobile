import { createSignal, onMount } from "solid-js";
import { appStore, setActiveTab } from "../store/app";
import { haptic } from "../lib/capacitor";
import { fetchRepoStatus, type RepoStatus } from "../lib/github";
import { fetchWorkerStatus, type WorkerStatus } from "../lib/cloudflare";
import { showStatus } from "../lib/status";

export function Header() {
  const [repo, setRepo] = createSignal<RepoStatus | null>(null);
  const [worker, setWorker] = createSignal<WorkerStatus | null>(null);

  onMount(() => {
    fetchRepoStatus().then(setRepo).catch(() => null);
    fetchWorkerStatus().then(setWorker).catch(() => null);
  });

  function newTab() {
    haptic("light");
    setActiveTab("agent");
    showStatus("Open AI agent to create a new tab", "info");
  }

  const now = new Date();

  const titles: Record<string, string> = {
    home: "Home",
    clock: "Clock",
    task: "Tasks",
    devin: "Devin",
    notes: "Notes",
    saved: "Saved",
    email: "Email",
    agent: "New Tab",
  };

  return (
    <header class="flex flex-col gap-2 px-4 pt-safe pt-4 pb-2">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-text">{titles[appStore.activeTab] ?? appStore.activeTab}</h1>
          <p class="text-sm text-text-secondary">
            {now.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a
            href={repo()?.url ?? "https://github.com/newkub/newkub-mobile"}
            target="_blank"
            rel="noreferrer"
            onClick={() => haptic("light")}
            class="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text"
          >
            <span class="i-mdi-source-branch h-3.5 w-3.5" />
            {repo()?.name ?? "repo"}
            <span class="i-mdi-open-in-new h-3 w-3" />
          </a>
          <a
            href={worker()?.dashboard ?? "https://dash.cloudflare.com/"}
            target="_blank"
            rel="noreferrer"
            onClick={() => haptic("light")}
            class="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:text-text"
          >
            <span
              class={`i-mdi-cloud h-3.5 w-3.5 ${
                worker()?.status === "healthy" ? "text-primary" : "text-warning"
              }`}
            />
            {worker()?.status === "healthy" ? "live" : worker()?.status ?? "cloudflare"}
          </a>
          <button
            onClick={newTab}
            class="glass rounded-full p-2 text-text-secondary transition hover:text-primary"
          >
            <span class="i-mdi-plus h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
