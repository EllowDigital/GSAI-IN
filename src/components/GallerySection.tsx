
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import GalleryHeader from './gallery/GalleryHeader';
import GalleryGrid from './gallery/GalleryGrid';
import GalleryLightbox from './gallery/GalleryLightbox';

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

  return (
    <section
      id="gallery"
      className="py-16 md:py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden"
    >
      {/* Glassmorphism Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl backdrop-blur-sm" />
      <div className="absolute bottom-20 right-16 w-48 h-48 bg-gradient-to-br from-yellow-400/15 to-orange-400/15 rounded-full blur-3xl backdrop-blur-sm" />
      
      <div className="max-w-7xl mx-auto relative">
        <GalleryHeader />
        <GalleryGrid 
          images={images} 
          loading={loading} 
          onImageClick={openLightbox} 
        />
        <GalleryLightbox
          selectedImage={selectedImage}
          currentIndex={currentIndex}
          totalImages={images.length}
          onClose={closeLightbox}
          onNavigate={navigateImage}
        />
      </div>
    </section>
  );
}
