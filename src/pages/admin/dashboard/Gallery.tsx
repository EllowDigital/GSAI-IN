import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BadgePlus, Loader2, ArrowUp } from 'lucide-react';
import GalleryUploadDrawer from './GalleryUploadDrawer';
import GalleryImageCard from './GalleryImageCard';
import toast, { Toaster } from 'react-hot-toast';

type GalleryImage = {
  id: string;
  image_url: string;
  caption?: string | null;
  tag?: string | null;
  created_at?: string | null;
};

const masonryCols = {
  base: 'columns-1 sm:columns-2',
  md: 'md:columns-3',
  lg: 'lg:columns-4',
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Real-time subscription
  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!ignore) {
        if (error) toast.error('Could not fetch gallery.');
        setImages(data || []);
        setLoading(false);
      }
    };

    fetchGallery();

    const channel = supabase
      .channel('gsai-gallery-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gallery_images',
        },
        () => {
          fetchGallery();
        }
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  // Gather unique tags
  const tags = Array.from(
    new Set(
      images
        .map((img) => img.tag)
        .filter((tag): tag is string => !!tag && tag.trim().length > 0)
    )
  );

  const filteredImages = filterTag
    ? images.filter((img) => img.tag === filterTag)
    : images;

  // Back to Top Button
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowBackToTop(window.scrollY > 200);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="relative max-w-7xl mx-auto w-full min-h-screen flex flex-col bg-white pb-12">
      <Toaster position="top-right" />
      {/* Sticky header for mobile */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-yellow-50/95 via-white/90 to-white/75 backdrop-blur-lg px-2 xs:px-4 pt-4 pb-3 mb-2 border-b border-yellow-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 transition-shadow shadow-xs">
        <div>
          <h3 className="font-bold text-xl sm:text-2xl mb-1 text-yellow-500 font-montserrat leading-tight">
            🖼️ Gallery Manager
          </h3>
          <p className="text-muted-foreground mb-2 text-xs sm:text-sm">
            Upload, tag, organize, and delete images in your public gallery.
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 font-semibold rounded-2xl shadow-lg hover:bg-yellow-500 transition text-base w-full sm:w-auto justify-center"
          onClick={() => setUploadDrawerOpen(true)}
        >
          <BadgePlus /> <span className="hidden xs:inline">Upload Image</span>
          <span className="inline xs:hidden">Upload</span>
        </button>
      </div>

      {/* Tags/Filters bar */}
      {tags.length > 0 && (
        <div className="w-full flex gap-x-2 gap-y-2 pb-3 flex-wrap overflow-x-auto px-1 sm:px-0 min-h-[40px]">
          <button
            className={`chip px-3 py-1 rounded-full font-inter shadow hover:shadow-lg focus:ring-2 transition border border-yellow-200 ${
              !filterTag
                ? 'bg-yellow-400 text-black'
                : 'bg-gray-100 hover:bg-yellow-100 text-gray-700'
            }`}
            onClick={() => setFilterTag(null)}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={`chip px-3 py-1 rounded-full font-inter shadow hover:shadow-lg focus:ring-2 transition border border-yellow-200 ${
                filterTag === tag
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 hover:bg-yellow-100 text-gray-700'
              }`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Gallery grid / Masonry */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center py-16 min-h-[60vh]">
            <Loader2 className="animate-spin text-yellow-400" size={48} />
          </div>
        ) : (
          <div
            className={`transition-all duration-300 w-full space-y-4 ${masonryCols.base} ${masonryCols.md} ${masonryCols.lg} gap-x-4 flex-1`}
            style={{ minHeight: '40vh' }} // Ensures grid fills available space
          >
            {filteredImages.length ? (
              filteredImages.map((img) => (
                <GalleryImageCard
                  key={img.id}
                  image={img}
                  onDeleteSuccess={() => {
                    setImages((cur) => cur.filter((i) => i.id !== img.id));
                    toast.success('Image deleted.');
                  }}
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-12 sm:py-16 text-lg font-semibold min-h-[30vh] flex items-center justify-center">
                No images found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload drawer for image uploads */}
      <GalleryUploadDrawer
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
      />

      {/* Back to top button (better position for mobile view) */}
      {showBackToTop && (
        <button
          className="fixed bottom-6 right-4 xs:right-6 sm:right-8 bg-yellow-400 hover:bg-yellow-500 rounded-full shadow-2xl p-3 z-50 transition flex items-center"
          aria-label="Back to Top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="text-black" size={22} />
        </button>
      )}
    </div>
  );
}
