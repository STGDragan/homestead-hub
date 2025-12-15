import React from "react";
import { createRoot } from "react-dom/client";

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Homestead Hub</h1>
      <p>If you can see this, React is running.</p>
    </div>
  );
}

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container missing");
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
