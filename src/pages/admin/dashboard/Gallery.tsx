import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import GalleryImageCard from './GalleryImageCard';
import GalleryUploadDrawer from './GalleryUploadDrawer';
import { exportGalleryToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/integrations/supabase/types';
import RefreshButton from '@/components/admin/RefreshButton';
import { toast } from '@/hooks/use-toast';

type GalleryImage = Tables<'gallery_images'>;

export default function Gallery() {
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
  const queryClient = useQueryClient();

  // Fetch gallery images
  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery_images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('gallery-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      setDeletingIds(prev => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message,
        variant: "error"
      });
    },
    onSettled: (_, __, id) => {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleUploadComplete = () => {
    setUploadDrawerOpen(false);
    // Auto-refresh after upload
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
    }, 100);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex gap-3 w-full sm:w-auto">
          <RefreshButton 
            onRefresh={handleRefresh}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          />
          <Button
            onClick={() => setUploadDrawerOpen(true)}
            className="flex gap-2 rounded-full flex-1 sm:flex-none"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Upload Images</span>
            <span className="inline sm:hidden">Upload</span>
          </Button>
        </div>
        
        <button
          onClick={() => exportGalleryToCsv(images)}
          className="border border-pink-400 px-3 md:px-4 py-2 rounded-full bg-pink-50 text-pink-700 font-medium hover:bg-pink-200 transition text-sm w-full sm:w-auto sm:min-w-[120px]"
          disabled={images.length === 0}
        >
          Export CSV
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-pink-400 rounded-full border-t-transparent" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No images found.
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => (
            <GalleryImageCard
              key={image.id}
              image={image}
              onDeleteSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
              }}
            />
          ))}
        </div>
      )}

      {/* Upload Drawer */}
      <GalleryUploadDrawer
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
      />
    </div>
  );
}
