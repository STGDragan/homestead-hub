
import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './src/App';
import './src/index.css'; 

console.log('Homestead Hub: Bootstrapping from index.tsx');

// Global Error Handler for non-React errors (e.g. SyntaxError, Import Failure)
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global Error Caught:", message, error);
};

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#5c412f', background: '#f5f0eb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px' }}>Reload</button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
}
