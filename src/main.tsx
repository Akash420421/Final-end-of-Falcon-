import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSmartZoomGatekeeper } from './utils/zoomGatekeeper';

// Smooth error boundary logging for ResizeObserver
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

// Initialize Smart 4-Finger Zoom Gatekeeper
// 1. 2-Finger Zoom-In Blocked: Prevents accidental mobile browser zoom freeze & white-screen issues.
// 2. 2-Finger Zoom-Out Allowed: Allows smooth recovery/reset if page is zoomed.
// 3. 4-Finger Zoom Active: Deliberate 4-finger touch fully enables unrestricted zoom.
// 4. Image Cropper Safe: Bypasses gatekeeper for admin image cropper touch controls.
initSmartZoomGatekeeper();

createRoot(document.getElementById('root')!).render(
  <App />
);

