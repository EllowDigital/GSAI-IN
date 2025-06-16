
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

interface GalleryLightboxProps {
  selectedImage: GalleryImage | null;
  currentIndex: number;
  totalImages: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export default function GalleryLightbox({ 
  selectedImage, 
  currentIndex, 
  totalImages, 
  onClose, 
  onNavigate 
}: GalleryLightboxProps) {
  return (
    <AnimatePresence>
      {selectedImage && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Close Button with Neumorphism */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-60 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 shadow-neumorphic border border-white/20"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation Buttons with Glassmorphism */}
          {totalImages > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('prev');
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-60 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 shadow-neumorphic border border-white/20"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('next');
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-60 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 shadow-neumorphic border border-white/20"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image Container with Enhanced Glassmorphism */}
          <motion.div
            className="relative max-w-5xl max-h-[80vh] mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-neumorphic border border-white/20">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.caption || 'Gallery image'}
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
            
            {/* Caption in Lightbox with Glassmorphism */}
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md p-6 rounded-b-2xl border-t border-white/20">
                <p className="text-white text-lg font-medium leading-relaxed">
                  {selectedImage.caption}
                </p>
              </div>
            )}
          </motion.div>

          {/* Image Counter with Glassmorphism */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full shadow-neumorphic border border-white/20">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {totalImages}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
