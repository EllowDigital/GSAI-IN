
import { motion } from 'framer-motion';
import { Images } from 'lucide-react';

export default function GalleryHeader() {
  return (
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
  );
}
