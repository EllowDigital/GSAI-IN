
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1466721591366-2d5fba72006d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1493962853295-0fd70327578a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=600&q=80",
];

export default function GallerySection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="gallery" className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-8 text-center">🖼️ Gallery</h2>
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
          {images.map((url, i) => (
            <img
              key={url}
              src={url}
              alt={`Gallery ${i + 1}`}
              className="w-full rounded-lg shadow-sm cursor-pointer mb-4 hover:opacity-90 transition"
              loading="lazy"
              onClick={() => setSelected(url)}
            />
          ))}
        </div>

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
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
