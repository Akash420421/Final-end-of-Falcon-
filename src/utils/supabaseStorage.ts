import { compressImageFile, compressImageDataUrl } from './imageCompressor';
import { supabase } from '../supabase';

/**
 * Uploads an image to Supabase Storage bucket 'falcon_assets' or returns compressed data URL.
 * Guarantees that images are lightweight, optimized, and persistent without breaking any links.
 */
export async function uploadOrCompressImage(
  dataUrlOrFile: string | File,
  folder: string = 'images'
): Promise<string> {
  if (!dataUrlOrFile) return '';

  // If already a remote URL (http/https), return as is
  if (typeof dataUrlOrFile === 'string' && (dataUrlOrFile.startsWith('http://') || dataUrlOrFile.startsWith('https://'))) {
    return dataUrlOrFile;
  }

  // If it's a preset identifier (e.g. 'fan-regulator-5step'), return as is
  if (typeof dataUrlOrFile === 'string' && !dataUrlOrFile.startsWith('data:')) {
    return dataUrlOrFile;
  }

  try {
    // Attempt Supabase storage upload if bucket is accessible
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.webp`;
    
    let blob: Blob;
    if (typeof dataUrlOrFile === 'string') {
      const compressedDataUrl = await compressImageDataUrl(dataUrlOrFile);
      const res = await fetch(compressedDataUrl);
      blob = await res.blob();
    } else {
      const compressedDataUrl = await compressImageFile(dataUrlOrFile);
      const res = await fetch(compressedDataUrl);
      blob = await res.blob();
    }

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('falcon_assets')
      .upload(fileName, blob, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (!uploadError && uploadData?.path) {
      const { data: publicUrlData } = supabase.storage
        .from('falcon_assets')
        .getPublicUrl(uploadData.path);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('[Supabase Storage] Storage bucket upload fallback to compressed Data URL:', err);
  }

  // Fallback to local optimized base64 data URL
  if (typeof dataUrlOrFile !== 'string') {
    return await compressImageFile(dataUrlOrFile);
  }

  if (dataUrlOrFile.startsWith('data:image/')) {
    return await compressImageDataUrl(dataUrlOrFile);
  }

  return dataUrlOrFile;
}
