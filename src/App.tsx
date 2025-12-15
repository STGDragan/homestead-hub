
import React from 'react';

export const App = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      backgroundColor: '#f0fdf4', // leaf-50
      color: '#14532d', // leaf-900
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Hello World</h1>
      <p style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', opacity: 0.9 }}>Homestead Hub is connected.</p>
      
      <div style={{ 
        padding: '2rem', 
        backgroundColor: 'white', 
        borderRadius: '16px', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1.5rem', color: '#4b5563', lineHeight: '1.5' }}>
          The application is actively running from <code>src/App.tsx</code>.
        </p>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#9ca3af', 
          borderTop: '1px solid #e5e7eb', 
          paddingTop: '1rem',
          fontFamily: 'monospace'
        }}>
          Build Time Check: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
