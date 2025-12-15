import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Global Error Handler for non-React errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global Error Caught:", message, error);
};

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
          <App />
      </React.StrictMode>
    );
} else {
    console.error("Root element not found");
}