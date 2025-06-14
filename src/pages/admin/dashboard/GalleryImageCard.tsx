
import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import toast from "react-hot-toast";

type Props = {
  image: {
    id: string;
    image_url: string;
    caption?: string | null;
    tag?: string | null;
    created_at?: string | null;
  };
  onDeleteSuccess: () => void;
};

export default function GalleryImageCard({ image, onDeleteSuccess }: Props) {
  const [hover, setHover] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Infer storage path from public url
  function getStoragePath(url: string): string | null {
    const match = url.match(/gallery\/.+$/);
    return match ? match[0] : null;
  }

  async function handleDelete() {
    if (!window.confirm("Delete this image? This action cannot be undone.")) return;
    setDeleting(true);

    const storagePath = getStoragePath(image.image_url);
    let storageErr: any = null;
    if (storagePath) {
      const { error: deleteError } = await supabase.storage.from("gallery").remove([storagePath]);
      if (deleteError) storageErr = deleteError;
    }

    // Always try DB delete anyway (avoid orphaned metadata)
    const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", image.id);
    if (dbError || storageErr) {
      toast.error("Failed to delete image.");
      setDeleting(false);
      return;
    }
    setDeleting(false);
    onDeleteSuccess();
  }

  return (
    <div
      className="relative mb-3 group break-inside-avoid rounded-2xl bg-white shadow-lg overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      tabIndex={0}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <img
        src={image.image_url}
        alt={image.caption || "Gallery"}
        className="w-full h-auto object-cover rounded-2xl duration-200"
        loading="lazy"
        style={{ aspectRatio: "4/3", width: "100%" }}
      />
      {/* Overlay for delete button */}
      <div className={`absolute top-2 right-2 z-20 transition-opacity duration-200 ${hover ? "opacity-100" : "opacity-0"}`}>
        <button
          className="bg-red-500 text-white rounded-full shadow-md p-2 hover:bg-red-600 focus:outline-none"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete image"
        >
          {deleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={18} />}
        </button>
      </div>
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent py-3 px-4 text-white">
        {image.caption && <div className="text-base font-bold font-montserrat mb-1 truncate">{image.caption}</div>}
        {image.tag && (
          <span className="inline-block bg-yellow-400 text-black rounded px-2 py-0.5 text-xs font-semibold font-inter">
            {image.tag}
          </span>
        )}
      </div>
    </div>
  );
}
