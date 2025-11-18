import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (s: string | null) => void;
  onRemoveImage: () => void;
}
export default function EventImageUploader({
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
  onRemoveImage,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="font-medium text-sm">Image</div>
      {imagePreview && (
        <div className="relative">
          <img
            alt="Preview"
            src={imagePreview}
            className="w-full max-h-44 object-cover rounded-lg shadow border mb-2"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="absolute right-2 top-2"
            onClick={onRemoveImage}
          >
            Remove
          </Button>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => ref.current?.click()}
        className="w-fit"
      >
        {imagePreview ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  );
}
