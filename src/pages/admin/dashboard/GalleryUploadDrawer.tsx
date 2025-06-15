
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function GalleryUploadDrawer({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [tag, setTag] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      toast.error("Please select an image to upload.");
      return;
    }
    setUploading(true);

    // 1. Upload image to storage
    const ext = file.name.split('.').pop();
    const filePath = `gallery/${Date.now()}-${Math.random().toString(36).substr(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      toast.error("Image upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage.from("gallery").getPublicUrl(filePath);
    if (!urlData?.publicUrl) {
      toast.error("Upload succeeded but missing image URL.");
      setUploading(false);
      return;
    }

    // 3. Insert metadata in DB
    const meta = {
      image_url: urlData.publicUrl,
      caption: caption || null,
      tag: tag || null,
    };

    console.log("Uploading image, inserting metadata:", meta);

    const { error: insertError } = await supabase.from("gallery_images").insert([meta]);
    if (insertError) {
      toast.error("Upload failed (DB): " + insertError.message);
      console.error("Insert error details:", insertError);
      setUploading(false);
      return;
    }

    toast.success("Image uploaded!");
    setCaption("");
    setTag("");
    setFile(null);
    setUploading(false);
    onClose();
  }

  // Drag & drop support (for advanced)
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
    <Drawer open={open} onOpenChange={open => !open ? onClose() : undefined}>
      <DrawerContent>
        <form onSubmit={handleUpload} className="px-2 xs:px-4 py-4 space-y-6 w-full max-w-lg mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-lg sm:text-xl text-yellow-500 font-bold">
              Add Image to Gallery
            </DrawerTitle>
          </DrawerHeader>
          <div
            className={`rounded-xl border-2 border-dashed p-4 xs:p-6 text-center bg-gray-50 relative flex flex-col items-center justify-center cursor-pointer transition ${
              file ? "border-yellow-400 bg-yellow-50" : "hover:bg-yellow-100"
            }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            {!file ? (
              <>
                <span className="mb-2 block text-base xs:text-lg font-semibold text-gray-700 font-montserrat">
                  Drag &amp; drop or select image
                </span>
                <Input
                  type="file"
                  accept="image/*"
                  className="w-full mx-auto"
                  onChange={onFileInput}
                  disabled={uploading}
                />
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-32 xs:w-40 h-28 xs:h-32 object-contain rounded-lg border shadow mt-1 mb-2"
                />
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="bg-red-300 rounded px-3 py-1 text-black hover:bg-red-400 mt-2 transition"
                >
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
              onChange={e => setCaption(e.target.value)}
              maxLength={100}
              disabled={uploading}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Tag (optional)"
              value={tag}
              onChange={e => setTag(e.target.value.replace(/\s/g, ""))}
              maxLength={20}
              disabled={uploading}
              className="w-full"
            />
          </div>
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
                "Upload"
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
