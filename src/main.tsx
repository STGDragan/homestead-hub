
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

console.log('Homestead Hub: Bootstrapping from main.tsx');

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
          <App />
      </React.StrictMode>
    );
} else {
    console.error("Root element not found in DOM.");
}
