import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Grid3X3,
  Grid2X2,
  ArrowLeft,
  Calendar,
  Tag,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import { useGalleryQuery } from '@/hooks/useEnhancedQuery';
import { formatErrorForDisplay } from '@/utils/errorHandling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { Seo } from '@/components/Seo';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

export default function AllGalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [gridSize, setGridSize] = useState<'small' | 'large'>('large');

  const {
    data: allImages = [],
    isLoading: loading,
    error,
    refresh,
  } = useGalleryQuery();

  // Get unique tags for filtering
  const uniqueTags = useMemo(() => {
    const tags = allImages
      .map((img) => img.tag)
      .filter(Boolean)
      .reduce((acc, tag) => {
        if (tag && !acc.includes(tag)) acc.push(tag);
        return acc;
      }, [] as string[]);
    return tags;
  }, [allImages]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    const filtered = allImages.filter((img) => {
      const matchesSearch =
        !searchTerm ||
        img.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.tag?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = selectedTag === 'all' || img.tag === selectedTag;
      return matchesSearch && matchesTag;
    });

    // Sort images
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || '').getTime();
      const dateB = new Date(b.created_at || '').getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [allImages, searchTerm, selectedTag, sortBy]);

  const openLightbox = (image: GalleryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Manage document body overflow when lightbox opens/closes to avoid modifying
  // global state directly inside event handlers (satisfies eslint immutability rule)
  React.useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % filteredImages.length
        : (currentIndex - 1 + filteredImages.length) % filteredImages.length;

    setCurrentIndex(newIndex);
    setSelectedImage(filteredImages[newIndex]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <>
      <Seo
        title="Gallery - Academy Moments"
        description="Explore our complete collection of academy moments, training sessions, events, and achievements. Discover the energy and community spirit that defines our academy."
        keywords={[
          'martial arts academy',
          'gallery',
          'training photos',
          'events',
          'achievements',
          'community',
        ]}
      />

      <Navbar />

      <div className="min-h-screen bg-black text-white">
        {/* Header Section */}
        <section className="pt-24 md:pt-32 pb-12 md:pb-16 px-4 md:px-6 lg:px-8 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Back Button */}
            <motion.div
              className="mb-8 md:mb-12"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <Link to="/#gallery">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>

            {/* Header Content */}
            <motion.div
              className="text-center mb-12 md:mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 md:mb-8 bg-yellow-500/10 rounded-full border border-yellow-500/20 backdrop-blur-sm">
                <Images className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 mr-2" />
                <span className="text-xs md:text-sm font-bold text-yellow-500 uppercase tracking-wider">
                  Complete Gallery
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                Academy{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 animate-gradient-x">
                  Moments
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                Explore our complete collection of academy moments, training
                sessions, and achievements. Witness the journey of our
                champions.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors group">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {allImages.length}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                  Total Images
                </div>
              </div>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-orange-500/30 transition-colors group">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                  {uniqueTags.length}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                  Categories
                </div>
              </div>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-red-500/30 transition-colors group">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                  {filteredImages.length}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">
                  Filtered Results
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Controls Section */}
        <section className="pb-8 md:pb-12 px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8 md:mb-12 shadow-2xl shadow-black/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-yellow-500 transition-colors" />
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50 focus:ring-yellow-500/20 h-11 transition-all"
                  />
                </div>

                {/* Tag Filter */}
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-yellow-500/20 focus:border-yellow-500/50">
                    <div className="flex items-center">
                      <Filter className="w-4 h-4 mr-2 text-gray-500" />
                      <SelectValue placeholder="Filter by tag" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
                    <SelectItem
                      value="all"
                      className="focus:bg-white/10 focus:text-white"
                    >
                      All Categories
                    </SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem
                        key={tag}
                        value={tag}
                        className="focus:bg-white/10 focus:text-white"
                      >
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select
                  value={sortBy}
                  onValueChange={(value: 'newest' | 'oldest') =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 focus:ring-yellow-500/20 focus:border-yellow-500/50">
                    <div className="flex items-center">
                      {sortBy === 'newest' ? (
                        <SortDesc className="w-4 h-4 mr-2 text-gray-500" />
                      ) : (
                        <SortAsc className="w-4 h-4 mr-2 text-gray-500" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-white/10 text-white">
                    <SelectItem
                      value="newest"
                      className="focus:bg-white/10 focus:text-white"
                    >
                      Newest First
                    </SelectItem>
                    <SelectItem
                      value="oldest"
                      className="focus:bg-white/10 focus:text-white"
                    >
                      Oldest First
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Grid Size */}
                <div className="flex rounded-lg bg-white/5 border border-white/10 p-1 h-11">
                  <button
                    onClick={() => setGridSize('large')}
                    className={`flex-1 flex items-center justify-center rounded transition-all duration-200 ${
                      gridSize === 'large'
                        ? 'bg-white/10 text-yellow-500 shadow-sm'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridSize('small')}
                    className={`flex-1 flex items-center justify-center rounded transition-all duration-200 ${
                      gridSize === 'small'
                        ? 'bg-white/10 text-yellow-500 shadow-sm'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedTag !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-white/10">
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs px-3 py-1"
                    >
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 inline-flex items-center justify-center p-2 rounded focus:outline-none hover:text-yellow-400 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Badge>
                  )}
                  {selectedTag !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs px-3 py-1"
                    >
                      Tag: {selectedTag}
                      <button
                        onClick={() => setSelectedTag('all')}
                        className="ml-2 inline-flex items-center justify-center p-2 rounded focus:outline-none hover:text-orange-400 transition-colors"
                        aria-label="Clear tag filter"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Gallery Content */}
        <section className="pb-20 md:pb-32 px-4 md:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl"
              >
                <div className="flex items-center gap-4 text-red-400">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-base md:text-lg">
                      Failed to load gallery images
                    </p>
                    <p className="text-sm text-red-400/80 mt-1">
                      {formatErrorForDisplay(error)}
                    </p>
                  </div>
                  <Button
                    onClick={() => refresh()}
                    variant="outline"
                    size="sm"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20 md:py-32">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/10 rounded-full animate-spin border-t-yellow-500"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-red-500/50"></div>
                </div>
              </div>
            ) : filteredImages.length === 0 ? (
              <motion.div
                className="text-center py-20 md:py-32 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <Images className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {searchTerm || selectedTag !== 'all'
                    ? 'No Results Found'
                    : 'No Images Yet'}
                </h3>
                <p className="text-base text-gray-400 max-w-md mx-auto mb-8">
                  {searchTerm || selectedTag !== 'all'
                    ? 'Try adjusting your search terms or filters'
                    : 'Check back soon for amazing moments from our academy!'}
                </p>
                {(searchTerm || selectedTag !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag('all');
                    }}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                className={`grid gap-4 md:gap-6 ${
                  gridSize === 'large'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredImages.map((img, index) => (
                  <motion.div
                    key={img.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-[#0a0a0a] border border-white/5 shadow-lg hover:shadow-yellow-500/10 transition-all duration-500 cursor-pointer"
                    onClick={() => openLightbox(img, index)}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`relative overflow-hidden bg-white/5 ${
                        gridSize === 'large' ? 'aspect-[4/3]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={
                          img.caption || `Academy gallery image ${index + 1}`
                        }
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
                        <div className="bg-white/10 backdrop-blur-md rounded-full p-3 border border-white/20 text-white hover:bg-yellow-500 hover:border-yellow-500 transition-colors">
                          <Images className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Image Info */}
                    {(img.caption || img.tag) && gridSize === 'large' && (
                      <div className="p-4 md:p-5">
                        {img.caption && (
                          <p className="text-gray-200 font-medium text-sm md:text-base leading-relaxed line-clamp-2 mb-3 group-hover:text-white transition-colors">
                            {img.caption}
                          </p>
                        )}
                        {img.tag && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-white/5 text-gray-400 border-white/10 group-hover:border-yellow-500/30 group-hover:text-yellow-400 transition-colors"
                          >
                            <Tag className="w-3 h-3 mr-1.5" />
                            {img.tag}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Tag overlay for small grid */}
                    {img.tag && gridSize === 'small' && (
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-black/60 text-white backdrop-blur-sm px-2 py-0.5 border-none"
                        >
                          {img.tag}
                        </Badge>
                      </div>
                    )}

                    {/* Date overlay */}
                    {img.created_at && (
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 backdrop-blur-sm text-gray-300 text-xs px-2.5 py-1 rounded-full flex items-center border border-white/10">
                          <Calendar className="w-3 h-3 mr-1.5 text-yellow-500" />
                          {new Date(img.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-60 p-2 md:p-3 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 rounded-full transition-all duration-300 backdrop-blur-sm group"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-60 p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/50 rounded-full transition-all duration-300 backdrop-blur-sm group"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-60 p-2 md:p-3 lg:p-4 bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/50 rounded-full transition-all duration-300 backdrop-blur-sm group"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  </button>
                </>
              )}

              {/* Image Container */}
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
                  className="max-w-full max-h-full object-contain rounded-xl md:rounded-2xl shadow-2xl shadow-black/50 border border-white/10"
                />

                {/* Image Info Overlay */}
                {(selectedImage.caption || selectedImage.tag) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-8 lg:p-10 rounded-b-xl md:rounded-b-2xl backdrop-blur-sm">
                    {selectedImage.caption && (
                      <p className="text-white text-sm md:text-lg lg:text-xl font-bold leading-relaxed mb-3">
                        {selectedImage.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-gray-300 text-xs md:text-sm">
                      {selectedImage.tag && (
                        <div className="flex items-center px-2 py-1 rounded-md bg-white/10 border border-white/10">
                          <Tag className="w-3 h-3 md:w-4 md:h-4 mr-2 text-yellow-500" />
                          {selectedImage.tag}
                        </div>
                      )}
                      {selectedImage.created_at && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2 text-yellow-500" />
                          {new Date(
                            selectedImage.created_at
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Image Counter */}
              <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 px-4 md:px-6 py-2 md:py-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-white text-xs md:text-sm lg:text-base font-medium tracking-widest">
                  {currentIndex + 1} / {filteredImages.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FooterSection />
    </>
  );
}
