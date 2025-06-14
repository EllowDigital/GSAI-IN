
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Props = {
  imageUrl: string | null;
  onUpload: (imageUrl: string) => void;
  disabled?: boolean;
};

export default function NewsImageUploader({ imageUrl, onUpload, disabled }: Props) {
  const [uploading, setUploading] = React.useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `news-images/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
    const { error } = await supabase.storage.from("news-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });
    if (error) {
      alert('Failed to upload image');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
    onUpload(urlData.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="block">
          <Button asChild size="sm" variant="secondary" disabled={disabled || uploading}>
            <span>
              {uploading ? "Uploading..." : "Upload Image"}
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" disabled={disabled || uploading} onChange={handleUpload} />
        </label>
        {imageUrl && (
          <img src={imageUrl} alt="news" className="w-16 h-16 object-cover rounded-md border shadow" />
        )}
      </div>
    </div>
  );
}
