
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HomesteadMainscreen } from './HomesteadMainscreen';
import './index.css';

console.log('Homestead Hub: Bootstrapping...');

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
          <HomesteadMainscreen />
      </React.StrictMode>
    );
} else {
    console.error("Root element not found in DOM.");
}
