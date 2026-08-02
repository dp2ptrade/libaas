'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

type UploadedImage = {
  url: string;
  alt_text: string;
  is_primary: boolean;
};

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      newImages.push({
        url: urlData.publicUrl,
        alt_text: '',
        is_primary: images.length === 0 && newImages.length === 0,
      });
    }

    onChange([...images, ...newImages]);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }, [images, onChange]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    onChange(updated);
  };

  const setPrimary = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  const updateAlt = (index: number, alt: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt_text: alt } : img)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((img, i) => (
          <div key={i} className="relative group w-28 shrink-0">
            <div className={`relative w-28 h-28 rounded-lg overflow-hidden border-2 ${img.is_primary ? 'border-gold-500' : 'border-border'}`}>
              <img src={img.url} alt={img.alt_text || `Image ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {img.is_primary && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-gold-500 text-white text-[10px] font-medium">
                  Primary
                </span>
              )}
            </div>
            {!img.is_primary && (
              <button
                type="button"
                onClick={() => setPrimary(i)}
                className="w-full text-xs text-muted-foreground hover:text-gold-600 mt-1 text-center"
              >
                Set as primary
              </button>
            )}
            <input
              type="text"
              value={img.alt_text}
              onChange={(e) => updateAlt(i, e.target.value)}
              placeholder="Alt text"
              className="w-full text-xs border border-border rounded px-2 py-1 mt-1 focus:outline-none focus:border-gold-500"
            />
          </div>
        ))}

        {/* Upload tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-28 h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-gold-500 hover:text-gold-600 transition-colors shrink-0"
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <>
              <Upload size={22} />
              <span className="text-xs">Upload</span>
            </>
          )}
        </button>
      </div>

      {images.length === 0 && !uploading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <ImageIcon size={14} />
          Upload product images (JPG, PNG, WebP — max 5MB each)
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
