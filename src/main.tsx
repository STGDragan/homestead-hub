
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomesteadApp } from './HomesteadApp';
import './index.css';

console.log('BOOTSTRAPPING HOMESTEAD APP v2');

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
          <HomesteadApp />
      </React.StrictMode>
    );
} else {
    console.error("Root element not found!");
}
