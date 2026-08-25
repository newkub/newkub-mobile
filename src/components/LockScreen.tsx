import { useState, useEffect } from "react";
import { useAppStore } from "../store/app";
import { haptic } from "../lib/capacitor";
import { ChevronUp } from "lucide-react";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [time, setTime] = useState(new Date());
  const setActiveTab = useAppStore((s) => s.setActiveTab);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function unlock() {
    haptic("medium");
    setActiveTab("alarm");
    onUnlock();
  }

  return (
    <div
      onClick={unlock}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-bg p-6 transition-opacity duration-500"
    >
      <div className="flex-1" />
      <p className="text-7xl font-bold tabular-nums text-glow">
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
      </p>
      <p className="mt-2 text-lg text-text-secondary">
        {time.toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <div className="flex-1" />
      <div className="mb-8 flex animate-bounce flex-col items-center gap-1 text-text-secondary">
        <ChevronUp className="h-6 w-6" />
        <span className="text-sm">Tap or swipe up to unlock</span>
      </div>
    </div>
  );
}
