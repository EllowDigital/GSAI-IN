import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ImageIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGalleryQuery } from '@/hooks/useEnhancedQuery';
import Spinner from './ui/spinner';

export default function GallerySection() {
  const navigate = useNavigate();
  const { data: images, isLoading, error } = useGalleryQuery();
  const galleryImages = images ?? [];
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<
    number | null
  >(null);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedImageIndex(null);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) =>
        prev === null || prev === galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) =>
        prev === null || prev === 0 ? galleryImages.length - 1 : prev - 1
      );
    }
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowRight')
        setSelectedImageIndex((prev) =>
          prev === null || prev === galleryImages.length - 1 ? 0 : prev + 1
        );
      if (e.key === 'ArrowLeft')
        setSelectedImageIndex((prev) =>
          prev === null || prev === 0 ? galleryImages.length - 1 : prev - 1
        );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, galleryImages.length]);

  const variants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
      },
    },
    item: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    },
    header: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    },
  };

  return (
    <section
      id="gallery"
      className="section-shell relative bg-gradient-to-b from-amber-50/30 to-white overflow-hidden py-12 md:py-20 lg:py-24"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-yellow-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 md:w-80 md:h-80 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="section-stack relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16 lg:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={variants.header}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-base sm:text-lg font-semibold text-yellow-600 tracking-wide uppercase">
              Our Gallery
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Academy{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600">
              Moments
            </span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2">
            A glimpse into our training sessions, tournaments, and the vibrant
            community at Ghatak Sports Academy.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-yellow-400" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="h-px w-20 sm:w-32 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" />
            <div
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-orange-400 to-transparent" />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12 sm:py-16">
            <div className="flex flex-col items-center gap-4">
              <Spinner />
              <span className="text-gray-500 font-medium text-sm sm:text-base">
                Loading gallery...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Unable to Load Gallery
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              {error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary justify-center gap-2"
            >
              Try Again
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Empty State */}
        {!error && !isLoading && galleryImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
              Gallery Empty
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
              We're capturing new moments. Check back soon!
            </p>
          </motion.div>
        )}

        {/* Gallery Grid */}
        {galleryImages.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={variants.container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {galleryImages.slice(0, 8).map((image, idx) => (
              <motion.div
                key={image.id}
                className={`group relative overflow-hidden rounded-2xl shadow-md cursor-pointer ${
                  idx === 0 || idx === 7 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
                variants={variants.item}
                onClick={() => handleImageClick(idx)}
                whileHover={{ y: -5 }}
              >
                <div
                  className={`relative w-full h-full ${
                    idx === 0 || idx === 7 ? 'aspect-[4/3]' : 'aspect-square'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={image.caption || 'Gallery Image'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                    <p className="text-white font-medium text-sm sm:text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {image.caption || 'Ghatak Sports Academy'}
                    </p>
                    <div className="w-8 sm:w-12 h-1 bg-yellow-500 mt-2 sm:mt-3 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  </div>
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/20 backdrop-blur-md p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/40">
                    <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Button */}
        {galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12 md:mt-16"
          >
            <button
              onClick={() => navigate('/gallery')}
              className="btn-primary px-8 py-3 text-base sm:text-lg shadow-lg shadow-yellow-500/20"
            >
              View Full Gallery
            </button>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={handleCloseLightbox}
          >
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
              onClick={handleCloseLightbox}
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <button
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors z-50"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 sm:p-3 rounded-full hover:bg-white/10 transition-colors z-50"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[selectedImageIndex].image_url}
                alt={galleryImages[selectedImageIndex].caption}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              {galleryImages[selectedImageIndex].caption && (
                <div className="mt-4 text-white text-center text-base sm:text-lg font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  {galleryImages[selectedImageIndex].caption}
                </div>
              )}
              <div className="mt-2 text-white/50 text-sm">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
