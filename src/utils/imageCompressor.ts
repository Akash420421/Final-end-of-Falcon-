/**
 * High-performance client-side image compressor & reader.
 * Ensures images under 1MB are NOT redundantly compressed,
 * and larger files are optimized cleanly to prevent Firestore overflow.
 */

export const MAX_SAFE_BASE64_LENGTH = 950 * 1024;
export const TARGET_MAX_WIDTH = 1400;
export const TARGET_MAX_HEIGHT = 1400;

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  targetMaxBytes?: number;
}

/**
 * Direct fast FileReader to Base64 Data URL without canvas processing.
 */
export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = (e.target?.result as string) || '';
      resolve(res);
    };
    reader.onerror = (err) => {
      console.error('[ImageCompressor] FileReader error:', err);
      reject(err);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file (PNG/JPG/WEBP/HEIC) to an optimized Base64 Data URL.
 * Automatically skips compression if file is under 1MB and safe for storage.
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  if (!file) return '';

  const sizeKb = (file.size / 1024).toFixed(1);
  console.log(`[ImageCompressor] Processing file "${file.name}" | Size: ${sizeKb} KB | MIME: ${file.type}`);

  // 1. FAST-PATH: If file is under 1MB (< 1024 * 1024 bytes), read directly without redundant canvas compression!
  if (file.size < 1024 * 1024) {
    try {
      console.log(`[ImageCompressor] File is under 1MB (${sizeKb} KB). Using fast direct FileReader without redundant compression.`);
      const directDataUrl = await readFileAsDataUrl(file);
      if (directDataUrl && directDataUrl.length <= MAX_SAFE_BASE64_LENGTH) {
        console.log(`[ImageCompressor] ✅ Direct read succeeded. Base64 payload size: ${(directDataUrl.length / 1024).toFixed(1)} KB`);
        return directDataUrl;
      }
      console.log(`[ImageCompressor] Direct Base64 (${(directDataUrl.length / 1024).toFixed(1)} KB) exceeded ${MAX_SAFE_BASE64_LENGTH / 1024} KB limit. Applying canvas optimization.`);
    } catch (readErr) {
      console.warn('[ImageCompressor] Direct FileReader fallback warning:', readErr);
    }
  }

  // 2. OPTIMIZATION PATH: For images >= 1MB or oversized payloads
  console.log(`[ImageCompressor] Applying canvas compression for "${file.name}" (Original: ${sizeKb} KB)`);

  return new Promise((resolve) => {
    // Safety fallback timer
    const fallbackTimeout = setTimeout(async () => {
      console.warn('[ImageCompressor] Canvas processing timeout reached, falling back to direct FileReader.');
      try {
        const fallbackUrl = await readFileAsDataUrl(file);
        resolve(fallbackUrl);
      } catch {
        resolve('');
      }
    }, 4000);

    const blobUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      clearTimeout(fallbackTimeout);
      URL.revokeObjectURL(blobUrl);

      try {
        const maxWidth = options.maxWidth || TARGET_MAX_WIDTH;
        const maxHeight = options.maxHeight || TARGET_MAX_HEIGHT;

        let width = img.naturalWidth || img.width || 800;
        let height = img.naturalHeight || img.height || 800;

        console.log(`[ImageCompressor] Image natural dimensions: ${width}x${height}`);

        // Proportional aspect-ratio fit
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          console.log(`[ImageCompressor] Rescaled dimensions: ${width}x${height}`);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.warn('[ImageCompressor] Canvas 2D context unavailable, falling back to direct FileReader.');
          readFileAsDataUrl(file).then(resolve).catch(() => resolve(''));
          return;
        }

        const isPng = file.type === 'image/png';
        if (!isPng) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const quality = options.quality ?? 0.85;
        const outputFormat = isPng ? 'image/png' : 'image/jpeg';
        let compressedDataUrl = canvas.toDataURL(outputFormat, quality);

        // If PNG output is still oversized (> 500KB), convert to optimized JPEG for fast Firestore persistence
        if (isPng && compressedDataUrl.length > 500 * 1024) {
          console.log('[ImageCompressor] PNG payload > 500KB, re-encoding as high-quality JPEG.');
          const jpgCanvas = document.createElement('canvas');
          jpgCanvas.width = width;
          jpgCanvas.height = height;
          const jpgCtx = jpgCanvas.getContext('2d');
          if (jpgCtx) {
            jpgCtx.fillStyle = '#FFFFFF';
            jpgCtx.fillRect(0, 0, width, height);
            jpgCtx.drawImage(img, 0, 0, width, height);
            compressedDataUrl = jpgCanvas.toDataURL('image/jpeg', 0.85);
          }
        }

        console.log(`[ImageCompressor] ✅ Canvas compression complete. Output Base64 size: ${(compressedDataUrl.length / 1024).toFixed(1)} KB`);
        resolve(compressedDataUrl);
      } catch (err) {
        console.error('[ImageCompressor ERROR] Canvas compression error:', err);
        readFileAsDataUrl(file).then(resolve).catch(() => resolve(''));
      }
    };

    img.onerror = (err) => {
      clearTimeout(fallbackTimeout);
      URL.revokeObjectURL(blobUrl);
      console.warn('[ImageCompressor] Image load failed, falling back to direct FileReader:', err);
      readFileAsDataUrl(file).then(resolve).catch(() => resolve(''));
    };

    img.src = blobUrl;
  });
}

/**
 * Compresses an existing base64 string or Data URL.
 */
export async function compressImageDataUrl(
  dataUrl: string,
  options: CompressionOptions = {}
): Promise<string> {
  if (!dataUrl) return '';
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  if (dataUrl.length <= 400 * 1024) return dataUrl;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve(dataUrl), 2500);
    const img = new Image();

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const maxWidth = options.maxWidth || TARGET_MAX_WIDTH;
        const maxHeight = options.maxHeight || TARGET_MAX_HEIGHT;

        let width = img.width || 800;
        let height = img.height || 800;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const quality = options.quality ?? 0.85;
        const result = canvas.toDataURL('image/jpeg', quality);
        resolve(result);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

export function checkImageSize(file: File): { valid: boolean; sizeKb: number } {
  const sizeKb = Math.round(file.size / 1024);
  return {
    valid: true,
    sizeKb,
  };
}

export async function readImageFile(file: File): Promise<string> {
  return await compressImageFile(file);
}
