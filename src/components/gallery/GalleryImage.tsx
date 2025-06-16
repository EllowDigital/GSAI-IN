
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

interface GalleryImageProps {
  image: GalleryImage;
  index: number;
  onClick: (image: GalleryImage, index: number) => void;
  variants: any;
}

export default function GalleryImage({ image, index, onClick, variants }: GalleryImageProps) {
  return (
    <motion.div
      key={image.id}
      variants={variants}
      className="group relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-md shadow-neumorphic hover:shadow-neumorphic-hover border border-white/20 transition-all duration-500 cursor-pointer"
      onClick={() => onClick(image, index)}
      whileHover={{ y: -8 }}
    >
      {/* Image Container with Glassmorphism */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100/50 backdrop-blur-sm rounded-t-2xl">
        <img
          src={image.image_url}
          alt={image.caption || `Academy gallery image ${index + 1}`}
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
      {image.caption && (
        <div className="p-4 bg-white/40 backdrop-blur-sm rounded-b-2xl">
          <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed line-clamp-2">
            {image.caption}
          </p>
        </div>
      )}

      {/* Tag with Glassmorphism */}
      {image.tag && (
        <div className="absolute top-3 left-3">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-blue-800 text-xs font-semibold rounded-full shadow-neumorphic border border-white/30">
            {image.tag}
          </span>
        </div>
      )}
    </motion.div>
  );
}
