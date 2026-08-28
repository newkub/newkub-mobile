import { CheckCircle, AlertCircle, Info, XCircle } from "lucide-react";
import { useAppStore } from "../store/app";

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

const colors = {
  info: "bg-surface text-text",
  success: "bg-primary/20 text-primary",
  warning: "bg-amber-500/20 text-amber-400",
  error: "bg-rose-500/20 text-rose-400",
};

export function StatusToast() {
  const status = useAppStore((s) => s.status);
  if (!status) return null;

  const Icon = icons[status.type];

  return (
    <div className="fixed left-1/2 top-0 z-[80] w-full max-w-md -translate-x-1/2 px-4 pt-safe pt-4">
      <div className={`glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg ${colors[status.type]}`}>
        <Icon className="h-5 w-5 shrink-0" />
        <p className="flex-1 text-sm font-medium">{status.text}</p>
      </div>
    </div>
  );
}
