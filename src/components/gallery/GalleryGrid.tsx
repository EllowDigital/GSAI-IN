
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';
import GalleryImage from './GalleryImage';

type GalleryImageType = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

interface GalleryGridProps {
  images: GalleryImageType[];
  loading: boolean;
  onImageClick: (image: GalleryImageType, index: number) => void;
}

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

export default function GalleryGrid({ images, loading, onImageClick }: GalleryGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 shadow-neumorphic-inset"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
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
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {images.map((img, index) => (
        <GalleryImage
          key={img.id}
          image={img}
          index={index}
          onClick={onImageClick}
          variants={itemVariants}
        />
      ))}
    </motion.div>
  );
}
