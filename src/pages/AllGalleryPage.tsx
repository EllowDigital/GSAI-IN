import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Filter,
  Grid,
  List,
  Search,
  Calendar,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGalleryQuery } from '@/hooks/useEnhancedQuery';
import { formatErrorForDisplay } from '@/utils/errorHandling';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import Seo from '@/components/Seo';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

type ViewMode = 'grid' | 'masonry';
type SortOption = 'newest' | 'oldest' | 'tag';

export default function AllGalleryPage() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');

  // Enhanced data fetching
  const {
    data: allImages = [],
    isLoading: loading,
    error,
    refresh,
  } = useGalleryQuery();

  // Process and filter images
  const processedImages = useMemo(() => {
    let filtered = allImages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.tag?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tag filter
    if (filterTag !== 'all') {
      filtered = filtered.filter((img) => img.tag === filterTag);
    }

    // Sort images
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort(
          (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
        );
        break;
      case 'oldest':
        filtered = filtered.sort(
          (a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
        );
        break;
      case 'tag':
        filtered = filtered.sort((a, b) => (a.tag || '').localeCompare(b.tag || ''));
        break;
    }

    return filtered;
  }, [allImages, searchTerm, filterTag, sortBy]);

  // Get unique tags
  const uniqueTags = useMemo(() => {
    const tags = allImages
      .map((img) => img.tag)
      .filter((tag): tag is string => Boolean(tag))
      .filter((tag, index, array) => array.indexOf(tag) === index);
    return tags;
  }, [allImages]);

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
        ? (currentIndex + 1) % processedImages.length
        : (currentIndex - 1 + processedImages.length) % processedImages.length;

    setCurrentIndex(newIndex);
    setSelectedImage(processedImages[newIndex]);
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
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Seo
        title="Gallery - Ghatak Sports Academy India"
        description="Explore our complete gallery showcasing training sessions, events, achievements, and memorable moments at Ghatak Sports Academy India."
        keywords={["gallery", "photos", "images", "training", "events", "achievements", "martial arts", "sports academy"]}
      />
      
      <Navbar />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="pt-24 pb-20">
          {/* Header */}
          <div className="px-4 md:px-6 lg:px-8 mb-12">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-8"
              >
                <Button variant="ghost" asChild className="p-2">
                  <Link to="/">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground">
                    Complete{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                      Gallery
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mt-2">
                    Explore all moments from our academy
                  </p>
                </div>
              </motion.div>

              {/* Filters and Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 shadow-soft mb-12"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold text-card-foreground">Filters & View</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'masonry' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('masonry')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger>
                      <Tag className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {uniqueTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger>
                      <Calendar className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="tag">Sort by Tag</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Images className="w-4 h-4 mr-2" />
                    {processedImages.length} images
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => refresh()}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-muted rounded-full animate-spin border-t-primary"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-accent"></div>
                  </div>
                </div>
              ) : processedImages.length === 0 ? (
                <motion.div
                  className="text-center py-20 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Images className="w-32 h-32 text-muted-foreground/40 mx-auto mb-8" />
                  <h3 className="text-3xl font-bold text-muted-foreground mb-4">
                    {searchTerm || filterTag !== 'all' ? 'No matching images' : 'No images yet'}
                  </h3>
                  <p className="text-xl text-muted-foreground/80 max-w-md mx-auto">
                    {searchTerm || filterTag !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'Check back soon for amazing moments from our academy!'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                      : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                  }`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {processedImages.map((img, index) => (
                    <motion.div
                      key={img.id}
                      variants={itemVariants}
                      className="group"
                    >
                      <Card className="overflow-hidden cursor-pointer hover:shadow-large transition-all duration-500">
                        <CardContent className="p-0">
                          <div
                            className="relative aspect-[4/3] overflow-hidden bg-muted"
                            onClick={() => openLightbox(img, index)}
                          >
                            <img
                              src={img.image_url}
                              alt={img.caption || `Gallery image ${index + 1}`}
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <div className="bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 shadow-lg">
                                <Images className="w-8 h-8 text-white" />
                              </div>
                            </div>
                            
                            {img.tag && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                                  {img.tag}
                                </Badge>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            {img.caption && (
                              <p className="text-card-foreground font-medium text-sm leading-relaxed mb-2 line-clamp-2">
                                {img.caption}
                              </p>
                            )}
                            {img.created_at && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(img.created_at)}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

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

              {processedImages.length > 1 && (
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
                    {selectedImage.created_at && (
                      <p className="text-white/80 text-sm mt-2">
                        {formatDate(selectedImage.created_at)}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-white text-lg font-semibold">
                  {currentIndex + 1} / {processedImages.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <FooterSection />
    </>
  );
}