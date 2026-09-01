import { createSignal, onMount, onCleanup } from "solid-js";
import { setActiveTab } from "../store/app";
import { haptic } from "../lib/capacitor";

export function LockScreen(props: { onUnlock: () => void }) {
  const [time, setTime] = createSignal(new Date());

  onMount(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    onCleanup(() => clearInterval(t));
  });

  function unlock() {
    haptic("medium");
    setActiveTab("alarm");
    props.onUnlock();
  }

  return (
    <div
      onClick={unlock}
      role="button"
      aria-label="Unlock"
      class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-bg p-6 transition-opacity duration-500"
    >
      <div class="flex-1" />
      <p class="text-7xl font-bold tabular-nums text-glow">
        {time().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
      </p>
      <p class="mt-2 text-lg text-text-secondary">
        {time().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <div class="flex-1" />
      <div class="mb-8 flex animate-bounce flex-col items-center gap-1 text-text-secondary">
        <span class="i-mdi-chevron-up h-6 w-6" />
        <span class="text-sm">Tap or swipe up to unlock</span>
      </div>
    </div>
  );
}
