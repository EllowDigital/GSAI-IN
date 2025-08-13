import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface StudentAvatarUploaderProps {
  url: string | null | undefined;
  onUploaded: (url: string) => void;
}

export default function StudentAvatarUploader({
  url,
  onUploaded,
}: StudentAvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputFile = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `students/${Date.now()}-${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
    setUploading(true);
    try {
      // Upload to storage bucket
      const { data, error } = await supabase.storage
        .from('gallery') // students avatars/images stored in gallery bucket's students/ folder
        .upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      // Get public URL
      const { data: _data } = await supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);
      if (!_data || !_data.publicUrl)
        throw new Error('Unable to get public URL.');
      onUploaded(_data.publicUrl);
    } catch (err: any) {
      toast.error('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border">
        {url ? (
          <img
            src={url}
            alt="Avatar"
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <User size={36} className="text-gray-400" />
        )}
      </div>
      <div>
        <Button
          type="button"
          onClick={() => inputFile.current?.click()}
          size="sm"
          variant="outline"
          disabled={uploading}
          className="rounded-full"
        >
          <Plus size={16} className="mr-1" />
          {uploading ? 'Uploading...' : url ? 'Change' : 'Upload'}
        </Button>
        <input
          type="file"
          accept="image/*"
          ref={inputFile}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>
    </div>
  );
}
