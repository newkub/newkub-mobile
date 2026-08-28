import { useState } from "react";
import { Plus, LayoutGrid, Clock, Cloud, StickyNote, CheckCircle2, Bookmark, Mail, Bot, Sparkles } from "lucide-react";
import { useAppStore, type HomeWidget } from "../store/app";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

const widgetTypes = [
  { type: "clock", label: "Clock", Icon: Clock },
  { type: "status", label: "Status", Icon: Cloud },
  { type: "notes", label: "Notes", Icon: StickyNote },
  { type: "tasks", label: "Tasks", Icon: CheckCircle2 },
  { type: "saved", label: "Saved", Icon: Bookmark },
  { type: "email", label: "Email", Icon: Mail },
  { type: "devin", label: "Devin", Icon: Bot },
];

const defaultWidgets: HomeWidget[] = [
  { id: "widget-welcome", type: "clock", title: "Clock", x: 0, y: 0, w: 1, h: 1 },
  { id: "widget-status", type: "status", title: "Status", x: 1, y: 0, w: 1, h: 1 },
  { id: "widget-notes", type: "notes", title: "Notes", x: 0, y: 1, w: 1, h: 1 },
];

export function HomeTab() {
  const widgets = useAppStore((s) => s.homeWidgets);
  const addHomeWidget = useAppStore((s) => s.addHomeWidget);
  const setHomeWidgets = useAppStore((s) => s.setHomeWidgets);
  const removeHomeWidget = useAppStore((s) => s.removeHomeWidget);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const [adding, setAdding] = useState(false);

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
    <div className="flex h-full flex-col px-4">
      {widgets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-text-secondary">
          <div className="mb-4 rounded-3xl bg-surface-2 p-6">
            <LayoutGrid className="h-12 w-12 text-primary" />
          </div>
          <p className="text-2xl font-bold text-text">Welcome to Newkub Mobile</p>
          <p className="mb-4 text-center text-sm text-text-secondary">Start with an empty home or use default widgets</p>

          <div className="mb-4 flex gap-3">
            <button
              onClick={useDefaults}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-white transition active:scale-95"
            >
              <Sparkles className="h-5 w-5" />
              Use default home
            </button>
            <button
              onClick={() => { haptic("light"); setAdding(!adding); }}
              className="flex items-center gap-2 rounded-full bg-surface-2 px-5 py-3 font-medium text-text transition active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Add widget
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {["clock", "task", "devin", "notes", "saved", "email"].map((tabId) => (
              <button
                key={tabId}
                onClick={() => openTab(tabId)}
                className="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium capitalize text-text-secondary transition hover:text-text"
              >
                Open {tabId}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 grid grid-cols-2 gap-3">
            {widgets.map((w) => (
              <div key={w.id} className="relative rounded-2xl bg-surface-2 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-text">{w.title}</span>
                  <button onClick={() => remove(w.id)} className="text-xs text-text-secondary hover:text-rose-400">×</button>
                </div>
                <WidgetPreview type={w.type} />
              </div>
            ))}
          </div>
          <button
            onClick={() => { haptic("light"); setAdding(!adding); }}
            className="mx-auto flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary transition hover:text-text"
          >
            <Plus className="h-4 w-4" />
            Add widget
          </button>
        </>
      )}

      {adding && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
          <p className="mb-2 text-sm font-medium text-text">Choose a widget</p>
          <div className="grid grid-cols-3 gap-2">
            {widgetTypes.map(({ type, label, Icon }) => (
              <button
                key={type}
                onClick={() => add(type)}
                className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 p-3 text-xs font-medium text-text-secondary transition hover:text-text"
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WidgetPreview({ type }: { type: string }) {
  switch (type) {
    case "clock":
      return <p className="text-2xl font-bold text-text">{new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</p>;
    case "status":
      return <p className="text-xs text-text-secondary">Repo & Cloudflare status preview</p>;
    case "notes":
      return <p className="text-xs text-text-secondary">Quick notes preview</p>;
    case "tasks":
      return <p className="text-xs text-text-secondary">Tasks preview</p>;
    case "saved":
      return <p className="text-xs text-text-secondary">Saved links preview</p>;
    case "email":
      return <p className="text-xs text-text-secondary">Email drafts preview</p>;
    case "devin":
      return <p className="text-xs text-text-secondary">AI agents preview</p>;
    default:
      return <p className="text-xs text-text-secondary">{type} widget</p>;
  }
}
