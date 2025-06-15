import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';

type Props = {
  feeId: string;
  initialUrl?: string | null;
  onUploaded: (url: string | null) => void;
};

export function FeeReceiptUploader({ feeId, initialUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(initialUrl || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `fee_${feeId}.${fileExt}`;
    // Upload file to Supabase
    const { error } = await supabase.storage
      .from('fees')
      .upload(filePath, file, { upsert: true });
    if (error) {
      alert('Error uploading file: ' + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('fees').getPublicUrl(filePath);
    if (data?.publicUrl) {
      setFileUrl(data.publicUrl);
      onUploaded(data.publicUrl);
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!fileUrl) return;
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;
    setUploading(true);
    await supabase.storage.from('fees').remove([fileName]);
    setFileUrl('');
    onUploaded(null);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {fileUrl ? (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline text-xs"
        >
          View Receipt
        </a>
      ) : null}
      <input
        type="file"
        accept="image/*,application/pdf"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleUpload}
      />
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex gap-1"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <UploadCloud className="w-4 h-4" />
        )}
        {fileUrl ? 'Replace' : 'Upload'}
      </Button>
      {fileUrl && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="text-red-600"
          disabled={uploading}
          onClick={handleRemove}
          title="Remove file"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
