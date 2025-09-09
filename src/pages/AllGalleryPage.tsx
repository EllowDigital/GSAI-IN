import React, { useState, useMemo } from 'react';
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
    let filtered = allImages.filter((img) => {
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
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  };

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

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
        {/* Header Section */}
        <section className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 lg:px-8 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-gradient-to-br from-primary/15 to-accent/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-16 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-accent/15 to-primary/15 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto relative">
            {/* Back Button */}
            <motion.div
              className="mb-6 md:mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                asChild
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90 text-sm"
              >
                <Link to="/#gallery">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </motion.div>

            {/* Header Content */}
            <motion.div
              className="text-center mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center justify-center p-3 mb-6 md:mb-8 bg-gradient-to-r from-primary/25 to-accent/25 rounded-full backdrop-blur-sm border border-primary/40">
                <Images className="w-5 h-5 md:w-6 md:h-6 text-primary mr-2 md:mr-3" />
                <span className="text-xs md:text-sm font-semibold text-primary uppercase tracking-wider">
                  Complete Gallery
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-4 md:mb-6 leading-tight">
                Academy{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse">
                  Gallery
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Explore our complete collection of academy moments, training
                sessions, and achievements
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-center p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">
                  {allImages.length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Total Images
                </div>
              </div>
              <div className="text-center p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-accent mb-1 md:mb-2">
                  {uniqueTags.length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Categories
                </div>
              </div>
              <div className="text-center p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-1 md:mb-2">
                  {filteredImages.length}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">
                  Filtered Results
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Controls Section */}
        <section className="pb-6 md:pb-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="bg-card/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-border/50 p-4 md:p-6 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search images..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 text-sm"
                  />
                </div>

                {/* Tag Filter */}
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
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
                  <SelectTrigger className="bg-background/50 border-border/50 text-sm">
                    {sortBy === 'newest' ? (
                      <SortDesc className="w-4 h-4 mr-2" />
                    ) : (
                      <SortAsc className="w-4 h-4 mr-2" />
                    )}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* Grid Size */}
                <div className="flex rounded-lg bg-background/50 border border-border/50 p-1">
                  <button
                    onClick={() => setGridSize('large')}
                    className={`flex-1 flex items-center justify-center p-2 rounded transition-colors ${
                      gridSize === 'large'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridSize('small')}
                    className={`flex-1 flex items-center justify-center p-2 rounded transition-colors ${
                      gridSize === 'small'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedTag !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border/50">
                  {searchTerm && (
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20 text-xs"
                    >
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 hover:text-primary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedTag !== 'all' && (
                    <Badge
                      variant="secondary"
                      className="bg-accent/10 text-accent border-accent/20 text-xs"
                    >
                      Tag: {selectedTag}
                      <button
                        onClick={() => setSelectedTag('all')}
                        className="ml-2 hover:text-accent"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Gallery Content */}
        <section className="pb-16 md:pb-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 md:mb-8 p-4 md:p-6 bg-destructive/5 border border-destructive/20 rounded-xl md:rounded-2xl"
              >
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm md:text-base">
                      Failed to load gallery images
                    </p>
                    <p className="text-xs md:text-sm text-destructive/80 mt-1">
                      {formatErrorForDisplay(error)}
                    </p>
                  </div>
                  <Button
                    onClick={() => refresh()}
                    variant="outline"
                    size="sm"
                    className="border-destructive/20 text-destructive hover:bg-destructive/10 text-xs"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-16 md:py-20">
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 border-3 md:border-4 border-muted rounded-full animate-spin border-t-primary"></div>
                  <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 border-3 md:border-4 border-transparent rounded-full animate-ping border-t-accent"></div>
                </div>
              </div>
            ) : filteredImages.length === 0 ? (
              <motion.div
                className="text-center py-16 md:py-20 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Images className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/40 mx-auto mb-4 md:mb-6" />
                <h3 className="text-xl md:text-2xl font-bold text-muted-foreground mb-3 md:mb-4">
                  {searchTerm || selectedTag !== 'all'
                    ? 'No Results Found'
                    : 'No Images Yet'}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground/80 max-w-md mx-auto mb-4 md:mb-6">
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
                    size="sm"
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
                    className="group relative overflow-hidden rounded-xl md:rounded-2xl bg-card shadow-soft hover:shadow-large transition-all duration-500 cursor-pointer"
                    onClick={() => openLightbox(img, index)}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`relative overflow-hidden bg-muted ${
                        gridSize === 'large' ? 'aspect-[4/3]' : 'aspect-square'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={
                          img.caption || `Academy gallery image ${index + 1}`
                        }
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white/20 backdrop-blur-lg rounded-full p-2 md:p-3 border border-white/30">
                          <Images className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Image Info */}
                    {(img.caption || img.tag) && gridSize === 'large' && (
                      <div className="p-3 md:p-4">
                        {img.caption && (
                          <p className="text-card-foreground font-medium text-xs md:text-sm leading-relaxed line-clamp-2 mb-2">
                            {img.caption}
                          </p>
                        )}
                        {img.tag && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            <Tag className="w-3 h-3 mr-1" />
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
                          className="text-xs bg-primary/90 text-primary-foreground backdrop-blur-sm px-2 py-1"
                        >
                          {img.tag}
                        </Badge>
                      </div>
                    )}

                    {/* Date overlay */}
                    {img.created_at && (
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
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
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 md:top-8 md:right-8 z-60 p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
              </button>

              {/* Navigation Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('prev');
                    }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-60 p-2 md:p-3 lg:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImage('next');
                    }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-60 p-2 md:p-3 lg:p-4 bg-white/10 hover:bg-white/20 rounded-full transition-colors duration-200 backdrop-blur-sm"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
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
                  className="max-w-full max-h-full object-contain rounded-xl md:rounded-2xl shadow-2xl"
                />

                {/* Image Info Overlay */}
                {(selectedImage.caption || selectedImage.tag) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 md:p-6 lg:p-8 rounded-b-xl md:rounded-b-2xl backdrop-blur-sm">
                    {selectedImage.caption && (
                      <p className="text-white text-sm md:text-lg lg:text-xl font-semibold leading-relaxed mb-2">
                        {selectedImage.caption}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-white/80 text-xs md:text-sm">
                      {selectedImage.tag && (
                        <div className="flex items-center">
                          <Tag className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          {selectedImage.tag}
                        </div>
                      )}
                      {selectedImage.created_at && (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
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
              <div className="absolute bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 px-3 md:px-4 lg:px-6 py-2 md:py-2 lg:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white text-xs md:text-sm lg:text-lg font-semibold">
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
