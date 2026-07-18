import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { initAttribution } from './lib/analytics';
import './index.css';

// Stash campaign UTMs before anything rewrites the URL — see src/lib/analytics.ts.
initAttribution();

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
      <Analytics />
    </HelmetProvider>
  </StrictMode>
);
