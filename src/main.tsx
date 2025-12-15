
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} else {
    document.body.innerHTML = '<div style="color: red; padding: 20px;">CRITICAL: Root element not found in index.html</div>';
}
