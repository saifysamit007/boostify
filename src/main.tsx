import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Comprehensive suppression for Vite HMR WebSocket connection errors in sandbox iframe environments
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason?.stack || reason || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://') ||
      msg.includes('closed without opened')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('error', (event) => {
    const msg = String(event.message || event.error?.message || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://') ||
      msg.includes('closed without opened')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  // Auto-remove any vite error overlay caused by websocket disconnections
  try {
    const observer = new MutationObserver(() => {
      const overlays = document.querySelectorAll('vite-error-overlay');
      overlays.forEach((el) => {
        const text = el.shadowRoot?.textContent || el.textContent || '';
        if (text.includes('WebSocket') || text.includes('closed without opened')) {
          el.remove();
        }
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } catch {
    // Ignore observer errors in non-browser environments
  }
}

createRoot(document.getElementById('root')!).render(<App />);

