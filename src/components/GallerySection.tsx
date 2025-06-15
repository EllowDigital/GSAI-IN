
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { GalleryHorizontal } from "lucide-react";

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
    <section id="gallery" className="py-12 xs:py-16 md:py-20 px-2 xs:px-3 md:px-4 bg-gradient-to-br from-yellow-50 via-white to-red-50 border-b border-yellow-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center mb-7 gap-2">
          <div className="flex items-center gap-2">
            <GalleryHorizontal size={32} className="text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 tracking-tight drop-shadow">
              Academy Photo Gallery
            </h2>
          </div>
          <p className="text-base md:text-lg font-medium text-gray-500 text-center max-w-xl">
            Dive into moments of training, triumph, and togetherness! Browse photos from recent sessions, events, and community fun.
          </p>
        </div>
        {loading ? (
          <div className="w-full flex justify-center items-center py-20">
            <span className="animate-spin w-8 h-8 rounded-full border-4 border-yellow-300 border-t-transparent inline-block" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-gray-400 text-center py-16 font-semibold">No images yet.</div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-3 xs:gap-5 md:gap-7">
            {images.map((img, i) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.caption || `Gallery ${i + 1}`}
                className="w-full aspect-[4/3] rounded-xl shadow hover:scale-105 transition-transform object-cover cursor-pointer"
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
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border-4 border-yellow-400"
                onClick={e => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
