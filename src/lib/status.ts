import { useAppStore } from "../store/app";

export function showStatus(text: string, type: "info" | "success" | "warning" | "error" = "info") {
  const haptics = useAppStore.getState().globalSettings.haptics;
  if (haptics && typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(type === "error" ? [50, 50, 50] : type === "success" ? 60 : 30);
    } catch {
      // ignore
    }
  }
  useAppStore.getState().setStatus({ text, type });
  setTimeout(() => {
    useAppStore.getState().clearStatus();
  }, 3000);
}
