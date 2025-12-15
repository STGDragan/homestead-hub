
import React, { ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
// import './index.css'; // REMOVED: File does not exist and causes blank screen crash

// Global Error Handler for non-React errors (e.g. SyntaxError, Import Failure)
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global Error Caught:", message, error);
    const root = document.getElementById('root');
    // Only override if React hasn't rendered anything yet (still blank)
    if (root && (!root.innerHTML || root.innerHTML === '')) {
        root.innerHTML = `
            <div style="padding: 2rem; color: #7f1d1d; background: #fef2f2; font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Startup Error</h1>
                <p>The application failed to start.</p>
                <pre style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; overflow: auto; max-width: 800px; text-align: left;">${message}\nAt: ${source}:${lineno}</pre>
                <button onclick="localStorage.clear(); window.location.reload();" style="padding: 0.75rem 1.5rem; background: #dc2626; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">
                    Factory Reset & Reload
                </button>
            </div>
        `;
    }
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

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // Log async errors but don't crash UI unless critical
    console.warn("Unhandled Async Error:", event.reason);
  };

  handleReset = () => {
      if (confirm("This will clear your local cached data to fix the crash. Your connection settings will be preserved. Continue?")) {
          const url = localStorage.getItem('homestead_supabase_url');
          const key = localStorage.getItem('homestead_supabase_key');
          const offline = localStorage.getItem('homestead_force_offline');
          
          localStorage.clear();
          
          if (url) localStorage.setItem('homestead_supabase_url', url);
          if (key) localStorage.setItem('homestead_supabase_key', key);
          if (offline) localStorage.setItem('homestead_force_offline', offline);
          
          window.location.reload();
      }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#5c412f', background: '#f5f0eb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#7f1d1d' }}>Something went wrong.</h1>
              <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>The application encountered an unexpected error.</p>
              
              <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb', maxHeight: '200px' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Error Details:</strong>
                {this.state.error?.toString()}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => window.location.reload()} 
                    style={{ flex: 1, padding: '0.75rem 1.5rem', background: '#705036', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Reload Page
                  </button>
                  <button 
                    onClick={this.handleReset}
                    style={{ flex: 1, padding: '0.75rem 1.5rem', background: 'transparent', color: '#dc2626', border: '2px solid #dc2626', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Reset App Data
                  </button>
              </div>
          </div>
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
} else {
    document.body.innerHTML = '<div style="padding: 2rem; color: red;"><h1>Critical Error: Root element not found</h1></div>';
}
