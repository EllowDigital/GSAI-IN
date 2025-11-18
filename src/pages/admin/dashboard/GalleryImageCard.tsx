import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

// CARD: responsive, adaptive overlays/texts and mobile-friendly interaction areas
type Props = {
  image: {
    id: string;
    image_url: string;
    caption?: string | null;
    tag?: string | null;
    created_at?: string | null;
  };
  onDeleteSuccess: () => void;
};

export default function GalleryImageCard({ image, onDeleteSuccess }: Props) {
  const [hover, setHover] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Infer storage path from public url
  function getStoragePath(url: string): string | null {
    const match = url.match(/gallery\/.+$/);
    return match ? match[0] : null;
  }

  async function handleDelete() {
    if (!window.confirm('Delete this image? This action cannot be undone.'))
      return;
    setDeleting(true);

    const storagePath = getStoragePath(image.image_url);
    let storageErr: any = null;
    if (storagePath) {
      const { error: deleteError } = await supabase.storage
        .from('gallery')
        .remove([storagePath]);
      if (deleteError) storageErr = deleteError;
    }

    // Always try DB delete anyway (avoid orphaned metadata)
    const { error: dbError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', image.id);
    if (dbError || storageErr) {
      toast.error('Failed to delete image.');
      setDeleting(false);
      return;
    }
    setDeleting(false);
    onDeleteSuccess();
  }

  return (
    <div
      className="relative mb-2 sm:mb-3 group break-inside-avoid rounded-xl sm:rounded-2xl bg-white shadow-md sm:shadow-lg overflow-hidden transition hover:shadow-xl sm:hover:shadow-2xl focus-within:shadow-xl sm:focus-within:shadow-2xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      tabIndex={0}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{ minWidth: 0 }} // for mobile column shrink
    >
      <img
        src={image.image_url}
        alt={image.caption || 'Gallery'}
        className="w-full h-auto object-cover rounded-xl sm:rounded-2xl duration-200 block aspect-[4/3] min-h-[120px] sm:min-h-[128px]"
        loading="lazy"
        style={{ width: '100%' }}
      />
      {/* Overlay for delete button - show on hover/focus or always on mobile */}
      <div
        className={`absolute top-1 right-1 sm:top-2 sm:right-2 z-20 transition-opacity duration-200 ${
          hover ? 'opacity-100' : 'opacity-0'
        } sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus:opacity-100 xs:opacity-100 xs:group-hover:opacity-100`}
      >
        <button
          className="bg-red-500 text-white rounded-full shadow-md p-1.5 sm:p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete image"
        >
          {deleting ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>
      {/* Caption & tag - adaptive for mobile */}
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent py-1.5 sm:py-2 xs:py-2.5 px-1.5 sm:px-2 xs:px-4 text-white select-none flex flex-col gap-0.5 sm:gap-1">
        {image.caption && (
          <div className="text-xs sm:text-sm xs:text-base font-bold font-montserrat mb-0.5 truncate max-w-full">
            {image.caption}
          </div>
        )}
        {image.tag && (
          <span className="inline-block bg-yellow-400 text-black rounded px-1.5 sm:px-2 py-0.5 text-xs xs:text-sm font-semibold font-inter max-w-full truncate">
            {image.tag}
          </span>
        )}
      </div>
    </div>
  );
}
