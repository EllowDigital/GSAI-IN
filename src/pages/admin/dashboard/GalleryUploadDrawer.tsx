import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, UploadCloud, X } from 'lucide-react';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GalleryUploadDrawer({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resetForm = () => {
    setFile(null);
    setCaption('');
    setTag('');
  };

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      toast.error('Please select an image to upload.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be smaller than 8MB.');
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Upload succeeded but image URL is missing.');
      }

      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert([
          {
            image_url: urlData.publicUrl,
            caption: caption.trim() || null,
            tag: tag.trim() || null,
          },
        ]);

      if (insertError) throw insertError;

      toast.success('Image uploaded successfully.');
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      resetForm();
      onClose();
    } catch (error) {
      const friendly = mapSupabaseErrorToFriendly(error);
      const message =
        friendly?.message ||
        (error instanceof Error ? error.message : 'Upload failed unexpectedly.');
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] || null);
  }

  function onDrop(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
    if (ev.dataTransfer.files && ev.dataTransfer.files.length > 0) {
      setFile(ev.dataTransfer.files[0]);
      ev.dataTransfer.clearData();
    }
  }

  function onDragOver(ev: React.DragEvent<HTMLDivElement>) {
    ev.preventDefault();
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !uploading) {
          resetForm();
          onClose();
        }
      }}
    >
      <DrawerContent>
        <form
          onSubmit={handleUpload}
          className="mx-auto w-full max-w-lg space-y-6 px-3 py-4 sm:px-4"
        >
          <DrawerHeader>
            <div className="space-y-2">
              <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">
                Upload Workspace
              </Badge>
              <DrawerTitle className="text-lg font-semibold text-foreground sm:text-xl">
                Add Image to Gallery
              </DrawerTitle>
            </div>
          </DrawerHeader>

          <div
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition ${
              file
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-muted/20 hover:bg-muted/40'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {!file ? (
              <>
                <UploadCloud className="mb-2 h-8 w-8 text-primary" />
                <span className="mb-2 block text-sm font-medium text-foreground sm:text-base">
                  Drag and drop or select image
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  className="mx-auto w-full"
                  onChange={onFileInput}
                  disabled={uploading}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 8MB
                </p>
              </>
            ) : (
              <div className="flex w-full flex-col items-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="mb-2 mt-1 h-32 w-40 rounded-lg border object-contain shadow"
                  />
                ) : (
                  <div className="mb-2 flex h-32 w-40 items-center justify-center rounded-lg border bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <p className="max-w-full truncate px-2 text-xs text-muted-foreground">
                  {file.name}
                </p>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-2 inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-2">
            <Input
              type="text"
              placeholder="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={100}
              disabled={uploading}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Tag (optional, no spaces)"
              value={tag}
              onChange={(e) => setTag(e.target.value.replace(/\s/g, ''))}
              maxLength={20}
              disabled={uploading}
              className="w-full"
            />
          </div>

          <DrawerFooter className="flex w-full flex-col gap-3">
            <Button
              type="submit"
              className="h-11 w-full rounded-xl text-base"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full rounded-xl text-base"
              onClick={onClose}
              disabled={uploading}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
