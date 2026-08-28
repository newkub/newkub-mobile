import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Uncaught error:", error, info.componentStack);
  }

  reload = () => {
    window.location.reload();
  };

  reset = () => {
    try {
      localStorage.removeItem("newkub-mobile-app-storage");
      this.reload();
    } catch {
      this.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-text">Something went wrong</h1>
        <p className="mb-6 text-sm text-muted">
          {this.state.error?.message ?? "An unexpected error occurred."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={this.reload}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Reload
          </button>
          <button
            onClick={this.reset}
            className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text"
          >
            Reset data & reload
          </button>
        </div>
      </div>
    );
  }
}
