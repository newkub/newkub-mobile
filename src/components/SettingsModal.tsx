import { useState } from "react";
import { X, Settings, Clock, Home, Image, SlidersHorizontal } from "lucide-react";
import { useAppStore, type TabDefinition } from "../store/app";
import { Button } from "./Button";
import { Input } from "./Input";
import { Switch } from "./Switch";
import { haptic } from "../lib/capacitor";
import { showStatus } from "../lib/status";

type Section = "global" | "tabs" | "logo" | "tab";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const store = useAppStore();
  const { globalSettings, setGlobalSetting, tabs, updateTab, elevenLabsKey, setElevenLabsKey, setActiveTab } = store;

  const [section, setSection] = useState<Section>("global");
  const [key, setKey] = useState(elevenLabsKey);

  function saveKey() {
    setElevenLabsKey(key);
    showStatus("ElevenLabs key saved", "success");
  }

  function toggleTab(tab: TabDefinition) {
    if (["home", "clock"].includes(tab.id)) {
      showStatus("Home and Clock tabs cannot be hidden", "warning");
      return;
    }
    updateTab(tab.id, { visible: !tab.visible });
    haptic(tab.visible ? "light" : "success");
  }

  function setStartup(tabId: string) {
    setGlobalSetting("startup", tabId as never);
    showStatus(`Startup tab set to ${tabs.find((t) => t.id === tabId)?.label ?? tabId}`, "success");
  }

  function setClockDefault(tab: string) {
    setGlobalSetting("defaultClockSubTab", tab as never);
  }

  const sections = [
    { id: "global" as const, label: "Global", Icon: SlidersHorizontal },
    { id: "tabs" as const, label: "Tabs", Icon: Home },
    { id: "logo" as const, label: "Logo", Icon: Image },
    { id: "tab" as const, label: "Per-Tab", Icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="h-[85vh] w-full max-w-2xl rounded-t-3xl bg-surface p-6 sm:h-auto sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-text">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-text-secondary hover:text-text">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {sections.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                section === id ? "bg-primary text-white" : "bg-surface-2 text-text-secondary hover:text-text"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="h-[55vh] space-y-5 overflow-y-auto pr-2 sm:h-auto">
          {section === "global" && (
            <>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-text">
                  <Home className="h-4 w-4 text-primary" /> Startup tab
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {["home", "last", ...tabs.filter((t) => t.visible).map((t) => t.id)].map((id) => (
                    <button
                      key={id}
                      onClick={() => setStartup(id)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                        globalSettings.startup === id
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary hover:text-text"
                      }`}
                    >
                      {id === "last" ? "Last used" : id === "home" ? "Home" : tabs.find((t) => t.id === id)?.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-text">
                  <Clock className="h-4 w-4 text-primary" /> Clock default sub-tab
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["alarm", "stopwatch", "timer", "pomodoro", "reminder"].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setClockDefault(sub)}
                      className={`rounded-xl px-3 py-2 text-sm font-medium capitalize transition ${
                        globalSettings.defaultClockSubTab === sub
                          ? "bg-primary text-white"
                          : "bg-surface text-text-secondary hover:text-text"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <h3 className="mb-3 font-semibold text-text">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Haptics</span>
                    <Switch checked={globalSettings.haptics} onChange={(v) => setGlobalSetting("haptics", v)} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Status toast</span>
                    <Switch checked={globalSettings.statusToast} onChange={(v) => setGlobalSetting("statusToast", v)} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">Notifications</span>
                    <Switch checked={globalSettings.notifications} onChange={(v) => setGlobalSetting("notifications", v)} />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <label className="mb-2 block text-sm font-medium text-text">ElevenLabs API Key</label>
                <Input type="text" value={key} onChange={setKey} placeholder="sk_..." />
                <p className="mt-2 text-xs text-muted">Stored locally on device. Never shared.</p>
                <Button onClick={saveKey} className="mt-3 w-full">Save key</Button>
              </div>
            </>
          )}

          {section === "tabs" && (
            <div className="rounded-2xl border border-border bg-surface-2 p-4">
              <h3 className="mb-3 font-semibold text-text">Visible tabs</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <label key={tab.id} className="flex items-center justify-between rounded-xl bg-surface p-3">
                    <span className="text-sm font-medium text-text">{tab.label}</span>
                    <Switch checked={tab.visible} onChange={() => toggleTab(tab)} />
                  </label>
                ))}
              </div>
            </div>
          )}

          {section === "logo" && (
            <div className="rounded-2xl border border-border bg-surface-2 p-4 text-center">
              <img src="/logo.svg" alt="App logo" className="mx-auto mb-4 h-24 w-24 rounded-3xl" />
              <p className="text-sm text-text-secondary">Current logo</p>
              <p className="mt-2 text-xs text-muted">Logo customization by URL coming soon.</p>
              <Button onClick={() => { setGlobalSetting("customLogo", "default"); showStatus("Logo reset to default", "success"); }} className="mt-3 w-full">
                Use default logo
              </Button>
            </div>
          )}

          {section === "tab" && (
            <>
              <div className="rounded-2xl border border-border bg-surface-2 p-4">
                <h3 className="mb-3 font-semibold text-text">Per-tab settings</h3>
                <p className="text-sm text-text-secondary">
                  Select a tab to configure. Clock sub-tabs use the Clock default setting.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tabs.filter((t) => t.visible).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); onClose(); showStatus(`Open ${tab.label} settings later`, "info"); }}
                    className="rounded-xl bg-surface-2 px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
