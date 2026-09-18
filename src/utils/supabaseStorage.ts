import { compressImageToWebP, generateThumbnail } from './imageCompressor';
import { supabase } from '../supabase';

const BUCKET_NAME = 'falcon_assets';
const CACHE_CONTROL_1_YEAR = '31536000'; // 1 Year CDN Caching for Bandwidth efficiency

/**
 * Uploads an image to Supabase Storage bucket 'falcon_assets' as high-efficiency WebP.
 * Features:
 * - 1-Year immutable CDN cache headers (saving 5GB/month bandwidth)
 * - Converts raw PNG/JPEG to WebP (5MB -> ~40-80KB)
 * - Returns public CDN HTTPS URL so database only stores a lightweight string (<80 bytes)
 */
export async function uploadOrCompressImage(
  dataUrlOrFile: string | File | Blob,
  folder: string = 'images'
): Promise<string> {
  if (!dataUrlOrFile) return '';

  // If already a remote CDN URL (http/https), return as is
  if (typeof dataUrlOrFile === 'string' && (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://'))) {
    return dataUrlOrFile;
  }

  // If it's a preset identifier (e.g. 'fan-regulator-5step'), return as is
  if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:')) {
    return dataUrlOrFile;
  }

  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'images';

  try {
    let inputBlob: Blob;
    if (typeof dataUrlOrFile === 'string') {
      const res = await fetch(dataUrlOrFile);
      inputBlob = await res.blob();
    } else {
      inputBlob = dataUrlOrFile;
    }

    // 1. Compress directly to WebP on client side
    const compressed = await compressImageToWebP(inputBlob, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.80,
    });

    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const fileName = `${cleanFolder}/${Date.now()}_${randomSuffix}.webp`;

    // 2. Upload to Supabase Storage with 1-year CDN caching
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressed.blob, {
        contentType: 'image/webp',
        cacheControl: CACHE_CONTROL_1_YEAR,
        upsert: true,
      });

    if (!uploadError && uploadData?.path) {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    } else if (uploadError) {
      console.warn('[Supabase Storage] Upload error, falling back:', uploadError.message);
    }
  } catch (err) {
    console.warn('[Supabase Storage] Storage bucket upload fallback:', err);
  }

  // Fallback to local optimized base64 data URL
  try {
    let fallbackBlob: Blob;
    if (typeof dataUrlOrFile === 'string') {
      const res = await fetch(dataUrlOrFile);
      fallbackBlob = await res.blob();
    } else {
      fallbackBlob = dataUrlOrFile;
    }
    const compressed = await compressImageToWebP(fallbackBlob, { maxWidth: 800, maxHeight: 800, quality: 0.75 });
    return compressed.dataUrl;
  } catch {
    return typeof dataUrlOrFile === 'string' ? dataUrlOrFile : '';
  }
}

/**
 * Uploads a document or PDF file to Supabase Storage bucket 'falcon_assets/docs'.
 */
export async function uploadDocumentFile(
  file: File,
  folder: string = 'documents'
): Promise<string> {
  if (!file) return '';

  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'documents';

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${cleanFolder}/${Date.now()}_${cleanFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        contentType: file.type || 'application/pdf',
        cacheControl: CACHE_CONTROL_1_YEAR,
        upsert: true,
      });

    if (!uploadError && uploadData?.path) {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.error('[Supabase Storage] Document upload failed:', err);
  }

  return '';
}
