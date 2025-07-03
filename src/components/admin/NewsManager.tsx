import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List, Newspaper } from 'lucide-react';
import NewsEditorModal from './NewsEditorModal';
import NewsDeleteDialog from './NewsDeleteDialog';
import { exportNewsToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/integrations/supabase/types';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/use-toast';

type NewsRow = Tables<'news'>;

export default function NewsManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRow | null>(null);
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const queryClient = useQueryClient();

  // Fetch news
  const { data: news = [], isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('news-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['news'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      setDeletingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: 'Success',
        description: 'News deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
    onSettled: (_, __, id) => {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
  });

  const handleEdit = (newsItem: NewsRow) => {
    setEditingNews(newsItem);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteNewsId(id);
  };

  const confirmDelete = () => {
    if (deleteNewsId) {
      deleteMutation.mutate(deleteNewsId);
      setDeleteNewsId(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingNews(null);
    // Auto-refresh after modal close
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }, 100);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['news'] });
      await queryClient.refetchQueries({ queryKey: ['news'] });
      toast({
        title: 'Success',
        description: 'News refreshed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh news',
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  const renderTableView = () => (
    <div className="rounded-2xl shadow-lg overflow-x-auto bg-white">
      <table className="w-full min-w-[600px]">
        <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200/60">
          <tr>
            <th className="text-left p-4 font-bold text-slate-700 text-xs uppercase tracking-wide">
              Image
            </th>
            <th className="text-left p-4 font-bold text-slate-700 text-xs uppercase tracking-wide">
              Title
            </th>
            <th className="text-left p-4 font-bold text-slate-700 text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="text-left p-4 font-bold text-slate-700 text-xs uppercase tracking-wide">
              Date
            </th>
            <th className="text-center p-4 font-bold text-slate-700 text-xs uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-orange-50/30 transition-all duration-200"
            >
              <td className="p-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </td>
              <td className="p-4">
                <h3 className="font-semibold text-gray-800 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {item.short_description}
                </p>
              </td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'Published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="p-4 text-sm text-gray-600">
                {formatDate(item.created_at)}
              </td>
              <td className="p-4">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    className="h-8 w-8 rounded-xl"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting(item.id)}
                    className="h-8 w-8 rounded-xl"
                  >
                    {isDeleting(item.id) ? 'Del...' : 'Delete'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCardsView = () => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {news.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow"
        >
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-32 object-cover rounded-md mb-3"
            />
          )}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {item.short_description}
          </p>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-500">
              {formatDate(item.created_at)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                item.status === 'Published'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {item.status}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(item)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(item.id)}
              disabled={isDeleting(item.id)}
              className="flex-1"
            >
              {isDeleting(item.id) ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Newspaper className="w-5 h-5 text-primary" />
                <span>News Management</span>
              </h2>

              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Create, edit, and manage news articles and announcements for
                your academy.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading || isRefreshing}
                className="flex-shrink-0"
              />
              <Button
                onClick={() => setModalOpen(true)}
                className="gap-2 shadow"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add News</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* View Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-between">
            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-full p-1 bg-muted/50 flex-1 sm:flex-initial">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-full px-3 flex-1 sm:flex-initial"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-full px-3 flex-1 sm:flex-initial"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Table</span>
              </Button>
            </div>

            <Button
              onClick={() => exportNewsToCsv(news)}
              disabled={news.length === 0}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial min-w-[100px]"
            >
              Export CSV
            </Button>
          </div>

          {/* Content */}
          <div className="w-full space-y-4">
            {isLoading || isRefreshing ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading news articles...
                </p>
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">📰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No news articles found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Get started by creating your first news article.
                </p>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Article
                </Button>
              </div>
            ) : viewMode === 'cards' ? (
              renderCardsView()
            ) : (
              renderTableView()
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewsEditorModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        editingNews={editingNews}
      />

      <NewsDeleteDialog
        open={!!deleteNewsId}
        onClose={() => setDeleteNewsId(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
