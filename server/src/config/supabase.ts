import { createClient } from '@supabase/supabase-js';
import { config } from './env';

/**
 * Supabase Admin client for server-side operations (storage, auth management).
 * Uses the service role key — keep this server-side only.
 */
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Upload a property image buffer to Supabase Storage from the server.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImageToStorage(
  buffer: Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from('property-images')
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);

  const { data: publicData } = supabaseAdmin.storage
    .from('property-images')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Remove an image from Supabase Storage.
 */
export async function removeImageFromStorage(filePath: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from('property-images')
    .remove([filePath]);

  if (error) throw new Error(`Supabase Storage delete failed: ${error.message}`);
}
