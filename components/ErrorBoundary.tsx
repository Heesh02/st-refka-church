import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('Unhandled app error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-zinc-400 text-sm mb-6">
              The app hit an unexpected error. Please reload and try again.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
