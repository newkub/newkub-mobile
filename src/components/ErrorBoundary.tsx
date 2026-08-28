import { ErrorBoundary as SolidErrorBoundary, type JSX } from "solid-js";

interface Props {
  children: JSX.Element;
}

function reload() {
  window.location.reload();
}

function resetAndReload() {
  try {
    localStorage.removeItem("newkub-mobile-store");
  } catch {
    // ignore
  }
  window.location.reload();
}

export function ErrorBoundary(props: Props) {
  return (
    <SolidErrorBoundary
      fallback={(_err, _reset) => (
        <div class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 class="mb-2 text-2xl font-bold text-text">Something went wrong</h1>
          <p class="mb-6 text-sm text-muted">An unexpected error occurred.</p>
          <div class="flex gap-3">
            <button
              onClick={reload}
              class="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Reload
            </button>
            <button
              onClick={resetAndReload}
              class="rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text"
            >
              Reset data & reload
            </button>
          </div>
        </div>
      )}
    >
      {props.children}
    </SolidErrorBoundary>
  );
}
