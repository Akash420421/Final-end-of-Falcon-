import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept benign ResizeObserver loop errors to prevent unhandled runtime error toasts
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('ResizeObserver loop') ||
     event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
     event.message.includes('ResizeObserver loop limit exceeded'))
  ) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <App />
);
