
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

export default function GallerySection() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!ignore) {
        setImages(data || []);
        setLoading(false);
      }
    };
    fetchImages();
    // Subscribe to realtime updates
    const channel = supabase
      .channel("gsai-gallery-public-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "gallery_images",
        },
        () => fetchImages()
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="gallery" className="py-10 xs:py-16 px-2 xs:px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold text-yellow-400 mb-6 xs:mb-8 text-center">🖼️ Gallery</h2>
        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <span className="animate-spin w-8 h-8 rounded-full border-4 border-yellow-300 border-t-transparent inline-block" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-gray-400 text-center py-16 font-semibold">No images yet.</div>
        ) : (
          <div className="columns-2 xs:columns-3 md:columns-4 gap-2 xs:gap-4 space-y-2 xs:space-y-4">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.caption || `Gallery ${i + 1}`}
                className="w-full rounded-lg shadow-sm cursor-pointer mb-2 xs:mb-4 hover:opacity-90 transition"
                loading="lazy"
                onClick={() => setSelected(img.image_url)}
              />
            ))}
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {selected && (
            <motion.div
              className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            >
              <img
                src={selected}
                alt="Preview"
                className="max-w-full max-h-[80vh] rounded-xl shadow-2xl border-4 border-yellow-400"
                onClick={e => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
