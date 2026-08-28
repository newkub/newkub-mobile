import { onMount, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { appStore, setActiveTab, closeSettings } from "./store/app";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import { StatusToast } from "./components/StatusToast";
import { OnboardingModal } from "./components/OnboardingModal";
import { SettingsModal } from "./components/SettingsModal";
import { HomeTab } from "./tabs/Home";
import { ClockTab } from "./tabs/Clock";
import { TaskTab } from "./tabs/Task";
import { DevinTab } from "./tabs/Devin";
import { NotesTab } from "./tabs/Notes";
import { SavedTab } from "./tabs/Saved";
import { EmailTab } from "./tabs/Email";
import { AgentTab } from "./tabs/Agent";

const builtInTabs: Record<string, () => JSX.Element> = {
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
  onMount(() => {
    const startup = appStore.globalSettings.startup;
    if (startup === "home") {
      setActiveTab("home");
    } else if (startup === "last") {
      setActiveTab(appStore.lastVisitedTab);
    } else {
      const found = appStore.tabs.find((t) => t.id === startup && t.visible);
      if (found) setActiveTab(startup);
      else setActiveTab("home");
    }
  });

  const currentTabId = () => appStore.activeTab;
  const activeComponent = () => builtInTabs[currentTabId()] ?? HomeTab;

  return (
    <div class="flex h-screen w-full flex-col bg-bg text-text">
      <Header />
      <TabBar />
      <StatusToast />
      <main class="tab-content flex-1 overflow-y-auto px-4 pb-4 pt-2">
        <Dynamic component={activeComponent()} />
      </main>
      <OnboardingModal />
      {appStore.settingsOpen && <SettingsModal onClose={closeSettings} />}
    </div>
  );
}
