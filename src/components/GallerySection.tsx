
import React from 'react';
import { Camera, Play, Award, Users, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GallerySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  // Placeholder gallery items - in real implementation, these would come from your database
  const galleryItems = [
    {
      type: 'image',
      title: 'Karate Championship 2024',
      description: 'Our students showcasing their skills at the regional championship',
      thumbnail: '/assets/slider/slider1.png',
      category: 'competitions',
    },
    {
      type: 'video',
      title: 'Training Session Highlights',
      description: 'A glimpse into our intensive training programs',
      thumbnail: '/assets/slider/slider2.png',
      category: 'training',
    },
    {
      type: 'image',
      title: 'Belt Grading Ceremony',
      description: 'Celebrating achievements and progress milestones',
      thumbnail: '/assets/slider/slider3.png',
      category: 'ceremonies',
    },
    {
      type: 'image',
      title: 'Team Building Activities',
      description: 'Building bonds beyond martial arts training',
      thumbnail: '/assets/slider/slider4.png',
      category: 'community',
    },
    {
      type: 'video',
      title: 'Self Defense Workshop',
      description: 'Empowering students with practical self-defense skills',
      thumbnail: '/assets/slider/slider5.png',
      category: 'workshops',
    },
    {
      type: 'image',
      title: 'Annual Sports Day',
      description: 'Celebrating sportsmanship and healthy competition',
      thumbnail: '/assets/slider/slider6.png',
      category: 'events',
    },
  ];

  const categories = ['all', 'competitions', 'training', 'ceremonies', 'community', 'workshops', 'events'];

  return (
    <section
      id="gallery"
      className="relative py-20 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/40 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-gradient-to-r from-yellow-200/40 to-red-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-16 md:mb-20" variants={itemVariants}>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-700 tracking-wide">Gallery</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Moments of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-yellow-600">
              Excellence
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our gallery showcasing the journey, achievements, and memorable moments of our students. 
            Every image tells a story of dedication, growth, and success.
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div className="flex flex-wrap justify-center gap-2 mb-12" variants={itemVariants}>
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full text-gray-700 font-medium hover:bg-gradient-to-r hover:from-yellow-500 hover:to-red-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 capitalize"
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              className="group relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Play Button for Videos */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`p-2 rounded-full shadow-lg ${
                    item.type === 'video' 
                      ? 'bg-red-500/80 backdrop-blur-sm' 
                      : 'bg-blue-500/80 backdrop-blur-sm'
                  }`}>
                    {item.type === 'video' ? (
                      <Play className="w-4 h-4 text-white" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {item.description}
                </p>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-gray-700 text-xs font-medium rounded-full border border-gray-200/50 capitalize">
                    {item.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-yellow-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl">
            <Award className="w-16 h-16 text-white mx-auto mb-6" />
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Create Your Own Success Story
            </h3>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Join our academy and become part of our gallery of champions. Your journey to greatness starts with a single step.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <span>Join Our Academy</span>
                <Users className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@ghatakgsai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105"
              >
                <Play className="w-5 h-5" />
                <span>Watch Videos</span>
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
