
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchImages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!ignore) {
        setImages(data || []);
        setLoading(false);
      }
    };
    fetchImages();
    const channel = supabase
      .channel('gsai-gallery-public-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_images',
        },
        () => fetchImages()
      )
      .subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

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
    const newIndex = direction === 'next' 
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
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        type: "spring" as const,
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <section
      id="gallery"
      className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden"
    >
      {/* Glassmorphism Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl backdrop-blur-sm" />
      <div className="absolute bottom-20 right-16 w-48 h-48 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl backdrop-blur-sm" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header with Glassmorphism */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Neumorphic Badge */}
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-white/70 backdrop-blur-md rounded-2xl shadow-neumorphic border border-white/20">
            <Images className="w-8 h-8 text-blue-600 mr-3" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Gallery</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Academy{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
              Moments
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover the energy, dedication, and community spirit that defines our academy through 
            these captured moments of training, events, and achievements.
          </p>
        </motion.div>

        {/* Gallery Content */}
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 shadow-neumorphic-inset"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
            </div>
          </div>
        ) : images.length === 0 ? (
          <motion.div 
            className="text-center py-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neumorphic">
              <Images className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">No Images Yet</h3>
            <p className="text-gray-500">Check back soon for amazing moments from our academy!</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md shadow-neumorphic hover:shadow-neumorphic-hover border border-white/20 transition-all duration-500 cursor-pointer"
                onClick={() => openLightbox(img, index)}
                whileHover={{ y: -8 }}
              >
                {/* Image Container with Glassmorphism */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100/50 backdrop-blur-sm rounded-t-2xl">
                  <img
                    src={img.image_url}
                    alt={img.caption || `Academy gallery image ${index + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[1px]" />
                  
                  {/* View Button with Neumorphism */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-md rounded-full p-3 border border-white/30 shadow-neumorphic">
                      <Images className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Caption with Glassmorphism */}
                {img.caption && (
                  <div className="p-4 bg-white/40 backdrop-blur-sm rounded-b-2xl">
                    <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed line-clamp-2">
                      {img.caption}
                    </p>
                  </div>
                )}

                {/* Tag with Glassmorphism */}
                {img.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-blue-800 text-xs font-semibold rounded-full shadow-neumorphic border border-white/30">
                      {img.tag}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Lightbox Modal with Glassmorphism */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              {/* Close Button with Neumorphism */}
              <button
                onClick={closeLightbox}
                className="absolute top-6 right-6 z-60 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 shadow-neumorphic border border-white/20"
                aria-label="Close gallery"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Buttons with Glassmorphism */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-60 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full transition-all duration-200 shadow-neumorphic border border-white/20"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
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
