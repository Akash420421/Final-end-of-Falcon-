import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

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

// Advanced Touch & Gesture Controller:
// 1. Completely blocks zoom-in attempts (2, 3, 4, ... 10 fingers)
// 2. Allows pinch-to-zoom-out / reset if screen is ever zoomed beyond scale 1
// 3. Blocks double-tap zoom and Ctrl/Cmd + Wheel zoom
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  let initialDistance = 0;

  // Safari / iOS gesture event handling
  document.addEventListener('gesturestart', (e: any) => {
    if (e.scale > 1.0) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('gesturechange', (e: any) => {
    if (e.scale > 1.0) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('gestureend', (e: any) => {
    if (e.scale > 1.0) {
      e.preventDefault();
    }
  }, { passive: false });

  // Chrome, Firefox, Android multi-touch (2 to 10+ fingers) prevention
  document.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      // Calculate initial finger distance
      initialDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e: TouchEvent) => {
    if (e.touches.length >= 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

      // If fingers are moving apart (currentDistance > initialDistance), user is attempting to ZOOM IN -> BLOCK IT!
      // If fingers are pinching together (currentDistance < initialDistance), ALLOW ZOOM OUT to return to normal
      if (currentDistance > initialDistance + 4) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  // Block double-tap to zoom
  let lastTouchEndTime = 0;
  document.addEventListener('touchend', (e: TouchEvent) => {
    const currentTime = Date.now();
    if (currentTime - lastTouchEndTime <= 300) {
      e.preventDefault();
    }
    lastTouchEndTime = currentTime;
    initialDistance = 0;
  }, { passive: false });

  // Block Desktop/Trackpad pinch-to-zoom (Ctrl + Wheel)
  document.addEventListener('wheel', (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.deltaY < 0) {
        // Zooming in -> Prevent
        e.preventDefault();
      }
    }
  }, { passive: false });

  // Block Keyboard Zoom In (Ctrl/Cmd + Plus / Equals)
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === 'Add')) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <App />
);
