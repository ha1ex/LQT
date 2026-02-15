import { createRoot } from 'react-dom/client'
import { initSentry } from './lib/sentry'
import { SentryErrorBoundary } from './components/ErrorBoundary'
import App from './App.tsx'
import './index.css'

initSentry();

createRoot(document.getElementById("root")!).render(
  <SentryErrorBoundary>
    <App />
  </SentryErrorBoundary>
);
