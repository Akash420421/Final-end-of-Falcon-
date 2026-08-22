/**
 * Smart 4-Finger Zoom Gatekeeper (Codebase Entrypoint)
 *
 * Rules:
 * 1. 2 Fingers Se Zoom-In Blocked: Normal browsing ke dauran 2 fingers se accidental zoom-in
 *    nahi hoga, jisse mobile freeze ya white screen ka koi chance nahi bacha.
 * 2. 2 Fingers Se Zoom-Out Allowed: Agar page zoomed state mein ho, toh 2 fingers se
 *    smoothly zoom-out / reset ho sakega.
 * 3. 4 Fingers Se Zoom Active: Zoom sirf tab allow hoga jab user deliberately 4 fingers
 *    (ya zyada) touch karega.
 * 4. Image Cropper Safe: Admin panel ke image cropper ke apne touch controls bilkul
 *    independently aur smoothly work karte hain bina kisi blockage ke.
 */

export function initSmartZoomGatekeeper(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let touchStartDistance = 0;
  let activeTouchCount = 0;

  const isCropperOrInteractive = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        '.cropper-touch-area, [data-cropper-area], .image-cropper-viewport, .image-cropper-modal, [data-cropper-touch-area="true"]'
      )
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    activeTouchCount = e.touches.length;

    if (isCropperOrInteractive(e.target)) {
      return;
    }

    if (e.touches.length === 2 || e.touches.length === 3) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistance = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isCropperOrInteractive(e.target)) {
      return;
    }

    // 4 or more fingers: User deliberately touches with 4 fingers -> Full Zoom Active!
    if (e.touches.length >= 4) {
      return; // Fully allowed (both zoom in and zoom out)
    }

    // 2 or 3 fingers: Evaluate zoom direction
    if (e.touches.length === 2 || e.touches.length === 3) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDistance = Math.hypot(dx, dy);

      // Fingers moving apart (Spreading = Zoom-In attempt) -> Block accidental zoom-in
      if (currentDistance > touchStartDistance + 6) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
      // Fingers moving together (Pinching = Zoom-Out attempt) -> Allow smooth zoom-out / reset
      else if (currentDistance < touchStartDistance - 6) {
        // Allowed: browser or visual viewport can zoom out smoothly
      }

      touchStartDistance = currentDistance;
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    activeTouchCount = e.touches.length;
    if (e.touches.length < 2) {
      touchStartDistance = 0;
    }
  };

  // Safari iOS WebKit gesture gatekeeper
  const handleGestureStart = (e: any) => {
    if (isCropperOrInteractive(e.target)) {
      return;
    }
    // Block zoom-in gesture if fewer than 4 fingers
    if (activeTouchCount < 4 && e.scale > 1.0) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleGestureChange = (e: any) => {
    if (isCropperOrInteractive(e.target)) {
      return;
    }
    // Block expanding gesture (zoom-in) if fewer than 4 fingers; allow shrinking (zoom-out)
    if (activeTouchCount < 4 && e.scale > 1.0) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  // Register listeners
  document.addEventListener('touchstart', handleTouchStart, { passive: true });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: true });
  document.addEventListener('touchcancel', handleTouchEnd, { passive: true });

  // WebKit iOS Safari gestures
  window.addEventListener('gesturestart', handleGestureStart as any, { passive: false });
  window.addEventListener('gesturechange', handleGestureChange as any, { passive: false });

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    document.removeEventListener('touchcancel', handleTouchEnd);
    window.removeEventListener('gesturestart', handleGestureStart as any);
    window.removeEventListener('gesturechange', handleGestureChange as any);
  };
}
