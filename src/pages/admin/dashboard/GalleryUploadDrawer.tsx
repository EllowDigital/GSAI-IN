import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

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

    // 1. Upload image to storage
    const ext = file.name.split('.').pop();
    const filePath = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      toast.error('Image upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from('gallery')
      .getPublicUrl(filePath);
    if (!urlData?.publicUrl) {
      toast.error('Upload succeeded but missing image URL.');
      setUploading(false);
      return;
    }

    // 3. Insert metadata in DB
    const meta = {
      image_url: urlData.publicUrl,
      caption: caption || null,
      tag: tag || null,
    };

    const { error: insertError } = await supabase
          className="px-3 py-4 space-y-6 w-full max-w-lg mx-auto sm:px-4"
      .insert([meta]);
    if (insertError) {
            <div className="space-y-2">
              <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">
                Upload Workspace
              </Badge>
              <DrawerTitle className="text-lg sm:text-xl font-semibold text-foreground">
                Add Image to Gallery
              </DrawerTitle>
            </div>
          </DrawerHeader>

          <div
            className={`rounded-xl border-2 border-dashed p-5 text-center bg-muted/20 relative flex flex-col items-center justify-center cursor-pointer transition ${
              file ? 'border-primary/50 bg-primary/5' : 'hover:bg-muted/40'
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {!file ? (
              <>
                <UploadCloud className="mb-2 h-8 w-8 text-primary" />
                <span className="mb-2 block text-sm sm:text-base font-medium text-foreground">
                  Drag and drop or select image
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  className="w-full mx-auto"
                  onChange={onFileInput}
                  disabled={uploading}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 8MB
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-40 h-32 object-contain rounded-lg border shadow mt-1 mb-2"
                  />
                ) : (
                  <div className="w-40 h-32 rounded-lg border bg-muted flex items-center justify-center mb-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground truncate max-w-full px-2">
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

          <div className="flex flex-col gap-2 w-full">
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

          <DrawerFooter className="flex flex-col gap-3 w-full">
            <Button
              type="submit"
              className="w-full rounded-xl text-base h-11"
              disabled={!file || uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span>Uploading...</span>
                  <span className="animate-spin">
                    <svg width={18} height={18} viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="40"
                        strokeDashoffset="20"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="40;0"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </span>
                </span>
              ) : (
                'Upload Image'
              )}
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
          <DrawerFooter className="flex flex-col gap-3 w-full">
            <Button
              type="submit"
              className="w-full font-bold rounded-xl text-base h-12"
              disabled={!file || uploading}
            >
              {uploading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span>Uploading...</span>
                  <span className="animate-spin">
                    <svg width={18} height={18} viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="8"
                        stroke="#eab308"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="40"
                        strokeDashoffset="20"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="40;0"
                          dur="1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </span>
                </span>
              ) : (
                'Upload'
              )}
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
