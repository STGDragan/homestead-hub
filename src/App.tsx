
import React, { useState, useEffect } from 'react';

export const App = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#059669', // Bright emerald green
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        color: '#059669',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0 0 1rem 0' }}>
          Hello World
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          Homestead Hub is connected.
        </p>
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.5rem', 
          backgroundColor: '#ecfdf5', 
          borderRadius: '0.5rem',
          fontFamily: 'monospace' 
        }}>
          Current Time: {time}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.8 }}>
          Serving from src/App.tsx
        </p>
      </div>
    </div>
  );
};
