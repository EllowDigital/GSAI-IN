
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  url: string;
  disabled?: boolean;
  onUpload(url: string): void;
};

export default function BlogImageUploader({ url, disabled, onUpload }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    const filename = `${Date.now()}-${file.name}`;
    // Ensure bucket exists: "blog-images"
    const { data, error } = await supabase.storage.from("blog-images").upload(filename, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (error) {
      alert("Failed to upload image: " + error.message);
      setUploading(false);
      return;
    }
    // Get public URL:
    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filename);
    onUpload(urlData.publicUrl || "");
    setUploading(false);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) upload(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) upload(f);
  }

  return (
    <div className="flex flex-col gap-2">
      {url && (
        <img
          alt="Blog img"
          src={url}
          className="w-full max-w-xs h-24 rounded-xl object-cover shadow border mb-2"
        />
      )}
      <div
        className={`flex items-center justify-center rounded-xl border-2 border-dashed border-yellow-300 py-5 bg-yellow-50 hover:bg-yellow-100 cursor-pointer transition ${disabled ? "opacity-70 pointer-events-none" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center text-yellow-600 text-sm font-semibold select-none">
          <Plus className="mb-1" />
          {uploading ? "Uploading..." : "Drag & drop or click to select image"}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="w-max mt-1 text-xs"
        onClick={() => onUpload("")}
        disabled={disabled || uploading}
      >
        Remove image
      </Button>
    </div>
  );
}
