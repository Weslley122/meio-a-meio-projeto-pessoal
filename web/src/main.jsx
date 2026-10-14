import React from 'react';
import ReactDOM from 'react-dom/client';
// Fontes servidas pelo próprio app (sem chamar o Google a cada visita).
import '@fontsource/bungee/400.css';
import '@fontsource/atkinson-hyperlegible/400.css';
import '@fontsource/atkinson-hyperlegible/700.css';
import './index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
