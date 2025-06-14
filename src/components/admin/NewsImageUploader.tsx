import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

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
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `news-images/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("news-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (uploadError) {
        console.error("Image upload error:", uploadError);
        toast.error(`Image upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // getPublicUrl only returns { data }
      const { data: urlData } = supabase.storage.from("news-images").getPublicUrl(filePath);
      if (!urlData?.publicUrl) {
        console.error("Could not get public URL data:", urlData);
        toast.error("Upload succeeded but image URL is missing.");
        setUploading(false);
        return;
      }
      onUpload(urlData.publicUrl);
      toast.success("Image uploaded.");
    } catch (ex: any) {
      console.error("Unknown upload exception:", ex);
      toast.error("Unexpected error during upload.");
    }
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
