import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload a file to Supabase Storage under the 'property-images' bucket.
 * Returns the public URL of the uploaded image.
 */
export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('property-images')
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data: publicData } = supabase.storage
    .from('property-images')
    .getPublicUrl(data.path);

  return publicData.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its path.
 */
export async function deletePropertyImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from('property-images').remove([path]);
  if (error) throw new Error(`Image delete failed: ${error.message}`);
}
