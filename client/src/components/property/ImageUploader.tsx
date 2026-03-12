'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadPropertyImage } from '@/lib/supabase';

interface ImageUploaderProps {
  propertyId?: string;
  onUpload: (url: string) => void;
  label?: string;
}

export function ImageUploader({ propertyId = 'temp', onUpload, label = 'Upload Image' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);
    try {
      const url = await uploadPropertyImage(file, propertyId);
      onUpload(url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors bg-gray-50"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="mx-auto h-32 object-cover rounded-lg" />
        ) : (
          <div className="space-y-1 text-gray-500">
            <p className="text-2xl">📷</p>
            <p className="text-sm font-medium">{uploading ? 'Uploading...' : label}</p>
            <p className="text-xs">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}
