import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border-2 border-red-200 rounded-xl m-4 font-mono text-sm overflow-auto max-h-screen">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Error Detectado</h1>
          <div className="bg-white p-4 rounded border border-red-100 shadow-sm mb-4">
            <p className="font-bold text-red-600 mb-2">Mensaje:</p>
            <pre className="whitespace-pre-wrap text-red-800">{this.state.error?.message}</pre>
          </div>
          <div className="bg-white p-4 rounded border border-red-100 shadow-sm mb-4">
            <p className="font-bold text-red-600 mb-2">Stack Trace:</p>
            <pre className="whitespace-pre-wrap text-xs text-slate-600">{this.state.error?.stack}</pre>
          </div>
          {this.state.errorInfo && (
            <div className="bg-white p-4 rounded border border-red-100 shadow-sm">
              <p className="font-bold text-red-600 mb-2">Component Stack:</p>
              <pre className="whitespace-pre-wrap text-xs text-slate-600">{this.state.errorInfo.componentStack}</pre>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
