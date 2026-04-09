import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  copied: boolean;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      copied: false,
    };
  }

  // Basic recovery logic to update state so next render shows fallback UI
  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `ERR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    this.setState({ errorInfo, errorId });

    // Custom error logging (e.g., Sentry, Datadog)
    console.error(`[${errorId}] ErrorBoundary caught:`, error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Optional: Send to production monitoring service
    // if (process.env.NODE_ENV === 'production') {
    //   trackError(error, { errorId, ...errorInfo });
    // }
  }

  private handleCopyId = () => {
    if (this.state.errorId) {
      const copyWithFallback = () => {
        const textArea = document.createElement('textarea');
        textArea.value = this.state.errorId;
        textArea.setAttribute('readonly', 'true');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textArea);
        return copied;
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(this.state.errorId).then(
            () => {
              this.setState({ copied: true });
              setTimeout(() => this.setState({ copied: false }), 2000);
            },
            () => {
              if (copyWithFallback()) {
                this.setState({ copied: true });
                setTimeout(() => this.setState({ copied: false }), 2000);
              }
            }
          );
          return;
        }

        if (copyWithFallback()) {
          this.setState({ copied: true });
          setTimeout(() => this.setState({ copied: false }), 2000);
        }
      } catch {
        // If copy fails, leave button state unchanged so ID remains visible for manual copy.
      }
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      copied: false,
    });
  };

  public render() {
    const { hasError, error, errorInfo, errorId, copied } = this.state;

    if (hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Visual Indicator */}
            <div className="bg-gradient-to-br from-rose-500 to-orange-500 p-10 text-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <AlertTriangle className="w-10 h-10 stroke-[2.5px]" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">
                Unexpected Error
              </h1>
              <p className="text-rose-100 font-medium">
                The application encountered a runtime exception.
              </p>
            </div>

            <div className="p-10">
              <div className="space-y-8">
                {/* User Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => window.location.reload()}
                    className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Reload System
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = '/')}
                    className="h-14 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 font-bold transition-all active:scale-95"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Return Home
                  </Button>
                </div>

                {/* Support Info */}
                <div className="bg-slate-50 rounded-[1.5rem] p-6 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Support Identifier
                    </p>
                    <code className="text-lg font-mono font-bold text-slate-700">
                      {errorId || 'GENERATING...'}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.handleCopyId}
                    className={cn(
                      'rounded-xl px-4 font-semibold transition-all',
                      copied
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-slate-500 hover:bg-slate-200/50'
                    )}
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    {copied ? 'Copied' : 'Copy ID'}
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-4">
                  <p className="text-sm font-medium text-slate-500">
                    Need urgent help?
                  </p>
                  <a
                    href="tel:+916394135988"
                    className="group flex items-center gap-3 px-6 py-3 rounded-full bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4 transition-transform group-hover:rotate-12" />
                    Contact Technical Support
                  </a>
                </div>

                {/* Developer Console (Debug Only) */}
                {isDev && error && (
                  <details className="group border border-amber-200 bg-amber-50/30 rounded-2xl overflow-hidden transition-all">
                    <summary className="list-none cursor-pointer p-4 flex items-center gap-2 font-bold text-amber-800 select-none">
                      <Bug className="w-4 h-4 transition-transform group-open:rotate-180" />
                      Debug Logs
                    </summary>
                    <div className="px-4 pb-4">
                      <div className="bg-slate-900 rounded-xl p-5 overflow-auto max-h-80 shadow-inner">
                        <p className="text-rose-400 font-mono text-sm font-bold mb-3">
                          {error.toString()}
                        </p>
                        {errorInfo && (
                          <pre className="text-slate-400 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                            {errorInfo.componentStack}
                          </pre>
                        )}
                        {error.stack && (
                          <pre className="mt-4 pt-4 border-t border-slate-800 text-slate-500 font-mono text-[10px] leading-relaxed">
                            {error.stack}
                          </pre>
                        )}
                      </div>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
