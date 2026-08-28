import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import { StatusToast } from "./components/StatusToast";
import { SettingsModal } from "./components/SettingsModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { HomeTab } from "./tabs/Home";
import { ClockTab } from "./tabs/Clock";
import { TaskTab } from "./tabs/Task";
import { DevinTab } from "./tabs/Devin";
import { NotesTab } from "./tabs/Notes";
import { SavedTab } from "./tabs/Saved";
import { EmailTab } from "./tabs/Email";
import { AgentTab } from "./tabs/Agent";
import { CustomTab } from "./tabs/Custom";
import { useAppStore } from "./store/app";

const builtInTabs: Record<string, React.ComponentType> = {
  home: HomeTab,
  clock: ClockTab,
  task: TaskTab,
  devin: DevinTab,
  notes: NotesTab,
  saved: SavedTab,
  email: EmailTab,
  agent: AgentTab,
};

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const globalSettings = useAppStore((s) => s.globalSettings);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const tabs = useAppStore((s) => s.tabs);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (globalSettings.startup === "home") {
      setActiveTab("home");
    } else if (globalSettings.startup === "last") {
      // activeTab restored by persist
    } else if (tabs.find((t) => t.id === globalSettings.startup && t.visible)) {
      setActiveTab(globalSettings.startup);
    }
  }, []); // run once on mount

  const Component = builtInTabs[activeTab];
  const customTab = tabs.find((t) => t.id === activeTab && t.type === "custom");

  return (
    <div className="relative flex h-screen w-screen flex-col bg-bg">
      <div className="fixed right-4 top-0 z-50 pt-safe">
        <button
          onClick={() => { setSettingsOpen(true); }}
          className="mt-4 rounded-full bg-surface-2 p-2.5 text-text-secondary transition hover:text-text"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
      <Header />
      <StatusToast />
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 pt-2">
        {Component ? <Component /> : customTab ? <CustomTab tab={customTab} /> : <HomeTab />}
      </main>
      <TabBar />
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      <OnboardingModal />
    </div>
  );
}
