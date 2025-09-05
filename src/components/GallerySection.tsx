import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGalleryQuery } from '@/hooks/useEnhancedQuery';
import { formatErrorForDisplay } from '@/utils/errorHandling';
import { Button } from '@/components/ui/button';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

export default function GallerySection() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Enhanced data fetching with error handling and retry
  const {
    data: allImages = [],
    isLoading: loading,
    error,
    refresh,
  } = useGalleryQuery();

  // Show only 6 most recent images on main page
  const images = allImages
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 6);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % images.length
        : (currentIndex - 1 + images.length) % images.length;

    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <section
      id="gallery"
      className="py-20 md:py-32 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-accent/5 relative overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-16 w-96 h-96 bg-gradient-to-br from-accent/5 to-primary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center p-3 mb-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full backdrop-blur-sm border border-primary/20">
            <Images className="w-6 h-6 text-primary mr-3" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Gallery
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-8 leading-tight">
            Academy{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              Moments
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            Discover the energy, dedication, and community spirit that defines
            our academy through these captured moments of training, events, and
            achievements.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Failed to load gallery images</p>
                <p className="text-sm text-destructive/80 mt-1">
                  {formatErrorForDisplay(error)}
                </p>
              </div>
              <button
                onClick={() => refresh()}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Retry loading gallery"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Gallery Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 sm:border-3 lg:border-4 border-muted rounded-full animate-spin border-t-primary"></div>
              <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 border-2 sm:border-3 lg:border-4 border-transparent rounded-full animate-ping border-t-accent"></div>
            </div>
          </div>
        ) : images.length === 0 ? (
          <motion.div
            className="text-center py-20 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Images className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-muted-foreground/40 mx-auto mb-4 sm:mb-6 lg:mb-8" />
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-muted-foreground mb-2 sm:mb-3 lg:mb-4">
              No Images Yet
            </h3>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground/80 max-w-md mx-auto">
              Check back soon for amazing moments from our academy!
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {images.map((img, index) => (
                <motion.div
                  key={img.id}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-3xl bg-card shadow-soft hover:shadow-large transition-all duration-700 cursor-pointer"
                  onClick={() => openLightbox(img, index)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={img.image_url}
                      alt={img.caption || `Academy gallery image ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                      <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 shadow-lg">
                        <Images className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  {img.caption && (
                    <div className="p-6">
                      <p className="text-card-foreground font-semibold text-base md:text-lg leading-relaxed line-clamp-2">
                        {img.caption}
                      </p>
                    </div>
                  )}
                  {img.tag && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
                        {img.tag}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* View All Gallery Button */}
            {allImages.length > 6 && (
              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link to="/gallery">
                    View All Gallery
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-8 right-8 z-60 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                aria-label="Close gallery"
              >
                <X className="w-8 h-8 text-white" />
              </button>

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-8 top-1/2 -translate-y-1/2 z-60 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-8 h-8 text-white" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 z-60 p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-8 h-8 text-white" />
                  </button>
                </>
              )}

              <motion.div
                className="relative max-w-6xl max-h-[85vh] mx-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.caption || 'Gallery image'}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                />
                {selectedImage.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-8 rounded-b-2xl backdrop-blur-sm">
                    <p className="text-white text-xl font-semibold leading-relaxed">
                      {selectedImage.caption}
                    </p>
                  </div>
                )}
              </motion.div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white text-lg font-semibold">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
