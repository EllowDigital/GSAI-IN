// --- PART 1 (State + Logic Setup) ---

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Table as TableIcon,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [tagFilter, setTagFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);

  const IMAGES_PER_PAGE = 20;
  const queryClient = useQueryClient();

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

  useEffect(() => {
    const channel = supabase
      .channel('gallery-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery_images' },
        () => queryClient.invalidateQueries({ queryKey: ['gallery_images'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      setDeletingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      toast({ title: 'Deleted', description: 'Image removed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
    onSettled: (_, __, id) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const handleDelete = (id: string) => deleteMutation.mutate(id);
  const isDeleting = (id: string) => deletingIds.has(id);

  const handleDeleteMany = () => {
    selectedImages.forEach((id) => deleteMutation.mutate(id));
    setSelectedImages(new Set());
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      await queryClient.refetchQueries({ queryKey: ['gallery_images'] });
      toast({
        title: 'Refreshed',
        description: 'Gallery updated successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to refresh gallery',
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredImages = images.filter((img) => {
    const matchesTag = tagFilter
      ? img.tag?.toLowerCase().includes(tagFilter.toLowerCase())
      : true;
    const createdAt = new Date(img.created_at || '');
    const withinDateRange =
      (!dateRange[0] || createdAt >= dateRange[0]) &&
      (!dateRange[1] || createdAt <= dateRange[1]);
    return matchesTag && withinDateRange;
  });

  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const paginatedImages = filteredImages.slice(
    (page - 1) * IMAGES_PER_PAGE,
    page * IMAGES_PER_PAGE
  );

  const toggleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleImageClick = (img: GalleryImage) => setPreviewImage(img);

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                <span>Gallery Management</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Upload, organize, and manage images for your academy gallery and
                content.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading || isRefreshing}
                className="flex-shrink-0"
              />
              <Button
                onClick={() => setUploadDrawerOpen(true)}
                className="gap-2 shadow"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Images</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <input
                type="text"
                placeholder="Filter by tag..."
                className="border border-input rounded-lg px-3 py-2 text-sm bg-background flex-1 sm:max-w-[200px]"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              />
              <div className="flex gap-2 flex-1 sm:flex-initial">
                <input
                  type="date"
                  className="border border-input rounded-lg px-3 py-2 text-sm bg-background flex-1"
                  onChange={(e) =>
                    setDateRange([
                      e.target.value ? new Date(e.target.value) : null,
                      dateRange[1],
                    ])
                  }
                />
                <input
                  type="date"
                  className="border border-input rounded-lg px-3 py-2 text-sm bg-background flex-1"
                  onChange={(e) =>
                    setDateRange([
                      dateRange[0],
                      e.target.value ? new Date(e.target.value) : null,
                    ])
                  }
                />
              </div>
            </div>

            {/* View Controls */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-full p-1 bg-muted/50 flex-1 sm:flex-initial">
                <Button
                  variant={viewMode === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('card')}
                  className="rounded-full px-3 flex-1 sm:flex-initial"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-full px-3 flex-1 sm:flex-initial"
                >
                  <TableIcon className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Table</span>
                </Button>
              </div>

              <Button
                onClick={() => exportGalleryToCsv(filteredImages)}
                disabled={filteredImages.length === 0}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial min-w-[100px]"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Multi Delete */}
          {selectedImages.size > 0 && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={handleDeleteMany}
                className="rounded-full text-sm"
              >
                Delete Selected ({selectedImages.size})
              </Button>
            </div>
          )}

          {/* Gallery View */}
          <div className="max-h-[70vh] overflow-y-auto">
            {isLoading || isRefreshing ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-pink-400 rounded-full animate-spin border-t-transparent" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No images found.
              </div>
            ) : viewMode === 'card' ? (
              <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedImages.map((image) => (
                  <GalleryImageCard
                    key={image.id}
                    image={image}
                    onDeleteSuccess={() =>
                      queryClient.invalidateQueries({
                        queryKey: ['gallery_images'],
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 font-semibold">Select</th>
                      <th className="p-3 font-semibold">Preview</th>
                      <th className="p-3 font-semibold">Caption</th>
                      <th className="p-3 font-semibold">Tag</th>
                      <th className="p-3 font-semibold">Uploaded</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedImages.map((image) => (
                      <tr
                        key={image.id}
                        className="hover:bg-muted/30 transition"
                      >
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={() => toggleSelect(image.id)}
                          />
                        </td>
                        <td className="p-3">
                          <img
                            src={image.image_url}
                            alt={image.caption ?? 'Image'}
                            className="h-16 w-24 object-cover rounded-md border"
                          />
                        </td>
                        <td className="p-3 max-w-xs truncate">
                          {image.caption}
                        </td>
                        <td className="p-3">
                          <span className="text-xs bg-yellow-300 text-black px-2 py-0.5 rounded">
                            {image.tag}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(
                            image.created_at || ''
                          ).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImageClick(image)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(image.id)}
                            disabled={isDeleting(image.id)}
                          >
                            {isDeleting(image.id) ? 'Deleting...' : 'Delete'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={p === page ? 'default' : 'outline'}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Drawer */}
      <GalleryUploadDrawer
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg max-w-3xl w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Image Preview</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-red-500 font-bold"
              >
                X
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewImage.image_url}
                alt={previewImage.caption ?? 'Preview'}
                className="w-full max-h-[70vh] object-contain rounded"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {previewImage.caption}{' '}
                {previewImage.tag && (
                  <span className="ml-2">#{previewImage.tag}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
