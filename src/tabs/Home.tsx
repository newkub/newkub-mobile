import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import {
  appStore,
  addHomeWidget,
  removeHomeWidget,
  setHomeWidgets,
  setActiveTab,
  type HomeWidget,
} from "../store/app";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

const widgetTypes = [
  { type: "clock", label: "Clock", icon: "i-mdi-clock" },
  { type: "status", label: "Status", icon: "i-mdi-cloud" },
  { type: "notes", label: "Notes", icon: "i-mdi-note" },
  { type: "tasks", label: "Tasks", icon: "i-mdi-check-circle" },
  { type: "saved", label: "Saved", icon: "i-mdi-bookmark" },
  { type: "email", label: "Email", icon: "i-mdi-email" },
  { type: "devin", label: "Devin", icon: "i-mdi-robot" },
];

const defaultWidgets: HomeWidget[] = [
  { id: "widget-welcome", type: "clock", title: "Clock", x: 0, y: 0, w: 1, h: 1 },
  { id: "widget-status", type: "status", title: "Status", x: 1, y: 0, w: 1, h: 1 },
  { id: "widget-notes", type: "notes", title: "Notes", x: 0, y: 1, w: 1, h: 1 },
];

function ClockWidget() {
  const [time, setTime] = createSignal(new Date());
  onMount(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    onCleanup(() => clearInterval(t));
  });
  return (
    <p class="text-2xl font-bold text-text">
      {time().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
    </p>
  );
}

function WidgetPreview(props: { type: string }) {
  switch (props.type) {
    case "clock":
      return <ClockWidget />;
    case "status":
      return <p class="text-xs text-text-secondary">Repo &amp; Cloudflare status preview</p>;
    case "notes":
      return <p class="text-xs text-text-secondary">Quick notes preview</p>;
    case "tasks":
      return <p class="text-xs text-text-secondary">Tasks preview</p>;
    case "saved":
      return <p class="text-xs text-text-secondary">Saved links preview</p>;
    case "email":
      return <p class="text-xs text-text-secondary">Email drafts preview</p>;
    case "devin":
      return <p class="text-xs text-text-secondary">AI agents preview</p>;
    default:
      return <p class="text-xs text-text-secondary">{props.type} widget</p>;
  }
}

export function HomeTab() {
  const [adding, setAdding] = createSignal(false);

  function add(type: string) {
    haptic("success");
    const widget: HomeWidget = {
      id: `widget-${Date.now()}`,
      type: type as HomeWidget["type"],
      title: type,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
    };
    addHomeWidget(widget);
    setAdding(false);
    showStatus(`Added ${type} widget`, "success");
  }

  function useDefaults() {
    haptic("success");
    setHomeWidgets([...defaultWidgets]);
    showStatus("Home set up with default widgets", "success");
  }

  function remove(id: string) {
    removeHomeWidget(id);
    haptic("light");
    showStatus("Widget removed", "info");
  }

  function openTab(tabId: string) {
    haptic("light");
    setActiveTab(tabId);
  }

  return (
    <div class="flex h-full flex-col px-4">
      <Show
        when={appStore.homeWidgets.length > 0}
        fallback={
          <div class="flex flex-1 flex-col items-center justify-center text-text-secondary">
            <div class="mb-4 rounded-3xl bg-surface-2 p-6">
              <span class="i-mdi-view-grid h-12 w-12 text-primary" />
            </div>
            <p class="text-2xl font-bold text-text">Welcome to Wrikka Mobile</p>
            <p class="mb-4 text-center text-sm text-text-secondary">Start with an empty home or use default widgets</p>

            <div class="mb-4 flex gap-3">
              <button
                onClick={useDefaults}
                class="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-white transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <span class="i-mdi-sparkles h-5 w-5" />
                Use default home
              </button>
              <button
                onClick={() => { haptic("light"); setAdding(!adding()); }}
                class="flex items-center gap-2 rounded-full bg-surface-2 px-5 py-3 font-medium text-text transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
              >
                <span class="i-mdi-plus h-5 w-5" />
                Add widget
              </button>
            </div>

            <div class="flex flex-wrap justify-center gap-2">
              <For each={["clock", "task", "devin", "notes", "saved", "email"]}>
                {(tabId) => (
                  <button
                    onClick={() => openTab(tabId)}
                    class="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium capitalize text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
                  >
                    Open {tabId}
                  </button>
                )}
              </For>
            </div>
          </div>
        }
      >
        <>
          <div class="mb-3 grid grid-cols-2 gap-3">
            <For each={appStore.homeWidgets}>
              {(w) => (
                <div class="relative rounded-2xl bg-surface-2 p-4">
                  <div class="mb-2 flex items-center justify-between">
                    <span class="text-sm font-medium capitalize text-text">{w.title}</span>
                    <button
                      onClick={() => remove(w.id)}
                      class="text-xs text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-rose-400"
                      aria-label="Remove widget"
                    >
                      ×
                    </button>
                  </div>
                  <WidgetPreview type={w.type} />
                </div>
              )}
            </For>
          </div>
          <button
            onClick={() => { haptic("light"); setAdding(!adding()); }}
            class="mx-auto flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
          >
            <span class="i-mdi-plus h-4 w-4" />
            Add widget
          </button>
        </>
      </Show>

      <Show when={adding()}>
        <div class="mt-4 rounded-2xl border border-border bg-surface p-3">
          <p class="mb-2 text-sm font-medium text-text">Choose a widget</p>
          <div class="grid grid-cols-3 gap-2">
            <For each={widgetTypes}>
              {({ type, label, icon }) => (
                <button
                  onClick={() => add(type)}
                  class="flex flex-col items-center gap-1 rounded-xl bg-surface-2 p-3 text-xs font-medium text-text-secondary transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:text-text"
                >
                  <span class={`${icon} h-5 w-5`} />
                  {label}
                </button>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
