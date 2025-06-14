import React, { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BadgePlus, Trash2, Loader2, ArrowUp } from "lucide-react";
import GalleryUploadDrawer from "./GalleryUploadDrawer";
import GalleryImageCard from "./GalleryImageCard";
import toast, { Toaster } from "react-hot-toast";

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

const masonryCols = {
  base: "columns-2",
  sm: "sm:columns-2",
  md: "md:columns-3",
  lg: "lg:columns-4",
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!ignore) {
        if (error) toast.error("Could not fetch gallery.");
        setImages(data || []);
        setLoading(false);
      }
    };

    fetchGallery();

    const channel = supabase
      .channel("gsai-gallery-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery_images",
        },
        (payload) => {
          // Re-fetch for simplicity to keep client in sync
          fetchGallery();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Gather unique tags
  const tags = Array.from(
    new Set(
      images
        .map((img) => img.tag)
        .filter((tag): tag is string => !!tag && tag.trim().length > 0)
    )
  );

  const filteredImages = filterTag
    ? images.filter((img) => img.tag === filterTag)
    : images;

  // Back to Top Button
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="relative max-w-7xl mx-auto w-full">
      <Toaster position="top-right" />
      <div className="mb-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h3 className="font-bold text-xl mb-1 text-yellow-500 font-montserrat">
            🖼️ Gallery Manager
          </h3>
          <p className="text-muted-foreground mb-2 text-sm">
            Upload, tag, organize, and delete images in your public gallery.
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 font-semibold rounded-2xl shadow-lg hover:bg-yellow-500 transition"
          onClick={() => setUploadDrawerOpen(true)}
        >
          <BadgePlus /> Upload Image
        </button>
      </div>

      {tags.length > 0 && (
        <div className="flex gap-2 pb-3 flex-wrap">
          <button
            className={`chip px-3 py-1 rounded-full font-inter shadow ${!filterTag ? "bg-yellow-400 text-black" : "bg-gray-200 hover:bg-yellow-100"}`}
            onClick={() => setFilterTag(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`chip px-3 py-1 rounded-full font-inter shadow ${filterTag === tag ? "bg-yellow-400 text-black" : "bg-gray-200 hover:bg-yellow-100"}`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-14">
          <Loader2 className="animate-spin text-yellow-400" size={48} />
        </div>
      ) : (
        <div className={`w-full space-y-4 ${masonryCols.base} ${masonryCols.sm} ${masonryCols.md} ${masonryCols.lg}`}>
          {filteredImages.length ? (
            filteredImages.map((img) => (
              <GalleryImageCard
                key={img.id}
                image={img}
                onDeleteSuccess={() => {
                  setImages((cur) => cur.filter((i) => i.id !== img.id));
                  toast.success("Image deleted.");
                  // No need to re-fetch, realtime will keep it in sync
                }}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No images found.
            </div>
          )}
        </div>
      )}

      <GalleryUploadDrawer
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
      />

      {showBackToTop && (
        <button
          className="fixed bottom-8 right-6 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-lg p-3 z-50 transition"
          aria-label="Back to Top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp className="text-black" />
        </button>
      )}
    </div>
  );
}
