import { Component, type ReactNode } from "react";

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

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-screen items-center justify-center bg-[#f5f0e8] p-6">
        <div className="max-w-md rounded-2xl border border-[rgba(74,60,46,0.12)] bg-white px-8 py-8 text-center shadow-lg">
          <div className="text-5xl">🖋️</div>
          <h1 className="mt-4 font-bold text-[#1a1410]" style={{ fontFamily: "Caveat, cursive", fontSize: "2rem" }}>
            Oops — ink spilled!
          </h1>
          <p className="mt-2 text-sm text-[#6b5d4f]">
            Something went wrong. Refresh the page to get back to the game.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-[#1a1410] px-6 py-2.5 text-sm font-semibold text-[#f5f0e8] transition hover:opacity-90"
          >
            Refresh
          </button>
          {this.state.error ? (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-[#a0917e]">Details</summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded bg-[#f5f0e8] p-2 text-[10px] text-[#6b5d4f]">
                {this.state.error.message}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    );
  }
}
