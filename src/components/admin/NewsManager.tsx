import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
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
    <div className="w-full px-2 sm:px-4">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4 mb-6">
        <div className="flex gap-3 w-full lg:w-auto">
          <RefreshButton
            onRefresh={handleRefresh}
            isLoading={isLoading || isRefreshing}
            className="flex-1 lg:flex-none"
          />
          <Button
            onClick={() => setModalOpen(true)}
            className="flex gap-2 rounded-full flex-1 lg:flex-none"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add News</span>
            <span className="inline sm:hidden">Add</span>
          </Button>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          {/* View Mode Toggle */}
          <div className="flex gap-1 border rounded-full p-1 bg-gray-50 flex-1 lg:flex-none">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-full px-3 flex-1 lg:flex-none"
            >
              <Grid size={16} />
              <span className="hidden sm:inline ml-1">Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-full px-3 flex-1 lg:flex-none"
            >
              <List size={16} />
              <span className="hidden sm:inline ml-1">Table</span>
            </Button>
          </div>
          <button
            onClick={() => exportNewsToCsv(news)}
            className="border border-orange-400 px-3 md:px-4 py-2 rounded-full bg-orange-50 text-orange-700 font-medium hover:bg-orange-200 transition text-sm flex-1 lg:flex-none lg:min-w-[120px]"
            disabled={news.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading || isRefreshing ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-orange-400 rounded-full border-t-transparent" />
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news articles found.
        </div>
      ) : viewMode === 'cards' ? (
        renderCardsView()
      ) : (
        renderTableView()
      )}

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
