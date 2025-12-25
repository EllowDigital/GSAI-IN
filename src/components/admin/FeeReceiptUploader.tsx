import React, { useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

// Allowed file types and max size for security
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type Props = {
  feeId: string;
  initialUrl?: string | null;
  onUploaded: (url: string | null) => void;
};

export function FeeReceiptUploader({ feeId, initialUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Get signed URL for existing receipt
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!initialUrl) {
        setFileUrl(null);
        setSignedUrl(null);
        return;
      }
      
      // Extract file path from URL
      const filePath = initialUrl.split('/').pop();
      if (!filePath) return;
      
      try {
        const { data, error } = await supabase.storage
          .from('fees')
          .createSignedUrl(filePath, 1800); // 30 min expiry
        
        if (error) {
          console.error('Error getting signed URL:', error);
          return;
        }
        
        setFileUrl(initialUrl);
        setSignedUrl(data.signedUrl);
      } catch (err) {
        console.error('Error fetching signed URL:', err);
      }
    };
    
    fetchSignedUrl();
  }, [initialUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WebP images and PDF are allowed.');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }
    
    setUploading(true);
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const filePath = `fee_${feeId}.${fileExt}`;
    
    // Upload file to Supabase
    const { error } = await supabase.storage
      .from('fees')
      .upload(filePath, file, { upsert: true });
      
    if (error) {
      toast.error('Error uploading file: ' + error.message);
      setUploading(false);
      return;
    }
    
    // Get signed URL for secure access
    const { data: signedData, error: signedError } = await supabase.storage
      .from('fees')
      .createSignedUrl(filePath, 1800); // 30 min expiry
    
    if (signedError) {
      toast.error('Error getting file URL: ' + signedError.message);
      setUploading(false);
      return;
    }
    
    // Store the path reference (not signed URL) in database
    const publicUrl = `${filePath}`;
    setFileUrl(publicUrl);
    setSignedUrl(signedData.signedUrl);
    onUploaded(publicUrl);
    toast.success('Receipt uploaded successfully');
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!fileUrl) return;
    const fileName = fileUrl.split('/').pop();
    if (!fileName) return;
    setUploading(true);
    await supabase.storage.from('fees').remove([fileName]);
    setFileUrl(null);
    setSignedUrl(null);
    onUploaded(null);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {signedUrl ? (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-700 underline text-xs"
        >
          View Receipt
        </a>
      ) : null}
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
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
