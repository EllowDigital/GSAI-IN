import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface EvidenceUploadButtonProps {
  progressId: string;
  onUploaded: (url: string) => void;
  disabled?: boolean;
}

export default function EvidenceUploadButton({
  progressId,
  onUploaded,
  disabled,
}: EvidenceUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const ext = file.name.split('.').pop();
      const filePath = `${progressId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from('progress-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('progress-media')
        .getPublicUrl(filePath);

      onUploaded(data.publicUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload evidence'
      );
    } finally {
      event.target.value = '';
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleChange}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || uploading}
        onClick={handlePick}
        className="gap-2"
      >
        {uploading ? 'Uploading…' : 'Evidence'}
      </Button>
    </>
  );
}
