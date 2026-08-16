import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Frontend ErrorBoundary caught error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-darkBg text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full glass-modal rounded-3xl p-8 space-y-6 shadow-2xl border border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected UI edge case occurred. The CineSense Error Boundary caught this safely.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reload CineSense Feed
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
