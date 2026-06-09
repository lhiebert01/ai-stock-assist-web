import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// After a redeploy, lazy chunks from a stale tab's build no longer exist and the
// server returns index.html for them (MIME mismatch) — dynamic imports like the
// PDF export (jspdf/html2canvas) then silently fail. Vite fires this event on
// such failures; reload once to pick up the current build. Guard against loops.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('vite-preload-reloaded')) {
    sessionStorage.setItem('vite-preload-reloaded', '1');
    window.location.reload();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
