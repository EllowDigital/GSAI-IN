import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Table as TableIcon,
  Image as ImageIcon,
  Eye,
  Trash2,
  CalendarDays,
  Search,
  Sparkles,
  CheckSquare,
  XCircle,
  Loader2,
} from 'lucide-react';
import GalleryUploadDrawer from './GalleryUploadDrawer';
import { exportGalleryToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/services/supabase/types';
import RefreshButton from '@/components/admin/RefreshButton';
import { toast } from '@/hooks/useToast';
import { usePersistentState } from '@/hooks/usePersistentState';

type GalleryImage = Tables<'gallery_images'>;

export default function Gallery() {
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );
  const [tagFilter, setTagFilter] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const IMAGES_PER_PAGE = 20;
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ['gallery_images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as GalleryImage[];
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      toast({ title: 'Deleted', description: 'Image removed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery_images'] });
      toast({
        title: 'Deleted',
        description: 'Selected images removed successfully',
      });
      setSelectedImages(new Set());
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this image?')) return;
    deleteMutation.mutate(id);
  };

  const handleDeleteMany = () => {
    if (selectedImages.size === 0) return;
    if (!window.confirm(`Delete ${selectedImages.size} selected images?`)) {
      return;
    }
    bulkDeleteMutation.mutate(Array.from(selectedImages));
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

  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      const searchable = `${img.caption || ''} ${img.tag || ''}`.toLowerCase();
      const matchesQuery = query.trim()
        ? searchable.includes(query.toLowerCase().trim())
        : true;
      const matchesTag = tagFilter
        ? img.tag?.toLowerCase().includes(tagFilter.toLowerCase())
        : true;

      const createdAt = new Date(img.created_at || '');
      const fromDate = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

      const withinDateRange =
        (!fromDate || createdAt >= fromDate) &&
        (!toDate || createdAt <= toDate);

      return matchesQuery && matchesTag && withinDateRange;
    });
  }, [images, query, tagFilter, dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [query, tagFilter, dateFrom, dateTo, viewMode]);

  const activeDateRange = useMemo(
    () => [dateFrom || null, dateTo || null] as [string | null, string | null],
    [dateFrom, dateTo]
  );

  const totalPages = Math.ceil(filteredImages.length / IMAGES_PER_PAGE);
  const paginatedImages = useMemo(
    () =>
      filteredImages.slice(
        (page - 1) * IMAGES_PER_PAGE,
        page * IMAGES_PER_PAGE
      ),
    [filteredImages, page]
  );

  const totalTagged = images.filter((img) => !!img.tag).length;
  const selectedCount = selectedImages.size;

  const toggleSelect = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleImageClick = (img: GalleryImage) => setPreviewImage(img);

  const toggleSelectAllOnPage = () => {
    setSelectedImages((prev) => {
      const next = new Set(prev);
      const allSelected = paginatedImages.every((img) => next.has(img.id));

      paginatedImages.forEach((img) => {
        if (allSelected) {
          next.delete(img.id);
        } else {
          next.add(img.id);
        }
      });

      return next;
    });
  };

  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Visual Content Workspace
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Gallery Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Upload, organize, preview, and curate gallery assets in one
                  streamlined modern workspace.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : images.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    With Tags
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : totalTagged}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Selected
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{selectedCount}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <div className="admin-toolbar">
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Gallery Controls
              </h2>
              <p className="text-sm text-muted-foreground">
                Filter and switch layouts quickly while keeping media operations
                simple.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading || isRefreshing}
                className="flex-shrink-0"
              />
              <Button
                onClick={() => setUploadDrawerOpen(true)}
                className="gap-2"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                Upload Images
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-panel-body space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by caption or tag..."
                className="pl-9"
              />
            </div>

            <Input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              placeholder="Filter by tag..."
            />

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="admin-toggle">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-full px-3"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-full px-3"
              >
                <TableIcon className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Table</span>
              </Button>
            </div>

            <Button
              onClick={() => exportGalleryToCsv(filteredImages)}
              disabled={filteredImages.length === 0}
              variant="outline"
              size="sm"
            >
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAllOnPage}
              disabled={paginatedImages.length === 0}
              className="gap-1.5"
            >
              <CheckSquare className="h-4 w-4" />
              Select Page
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedImages(new Set())}
              disabled={selectedImages.size === 0}
              className="gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              Clear Selection
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteMany}
              disabled={
                selectedImages.size === 0 || bulkDeleteMutation.isPending
              }
              className="gap-1.5"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Selected ({selectedImages.size})
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
            Showing {paginatedImages.length} of {filteredImages.length} filtered
            images.
            {activeDateRange[0] || activeDateRange[1]
              ? ' Date range filter active.'
              : ''}
          </div>

          <div className="max-h-[68vh] overflow-y-auto">
            {isLoading || isRefreshing ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-10 px-4">
                <ImageIcon className="w-16 h-16 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No images matched your filters.
                </p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="admin-card-grid">
                {paginatedImages.map((image) => (
                  <Card
                    key={image.id}
                    className="overflow-hidden border-border/70 transition-colors hover:bg-muted/20"
                  >
                    <CardContent className="p-0">
                      <button
                        type="button"
                        className="w-full"
                        onClick={() => handleImageClick(image)}
                      >
                        <img
                          src={image.image_url}
                          alt={image.caption ?? 'Gallery image'}
                          className="h-44 w-full object-cover"
                          loading="lazy"
                        />
                      </button>
                      <div className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium text-foreground">
                            {image.caption || 'Untitled image'}
                          </p>
                          <input
                            type="checkbox"
                            checked={selectedImages.has(image.id)}
                            onChange={() => toggleSelect(image.id)}
                            aria-label="Select image"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          {image.tag ? (
                            <Badge variant="outline" className="text-xs">
                              #{image.tag}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No tag
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              image.created_at || ''
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleImageClick(image)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(image.id)}
                            disabled={deleteMutation.isPending}
                            className="flex-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="admin-table-wrap">
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
                            loading="lazy"
                          />
                        </td>
                        <td className="p-3 max-w-xs truncate">
                          {image.caption || 'Untitled image'}
                        </td>
                        <td className="p-3">
                          {image.tag ? (
                            <Badge variant="outline">#{image.tag}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No tag
                            </span>
                          )}
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
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
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
      </section>

      <GalleryUploadDrawer
        open={uploadDrawerOpen}
        onClose={() => setUploadDrawerOpen(false)}
      />

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
