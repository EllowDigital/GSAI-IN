import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
        queryClient.invalidateQueries({ queryKey: ['news'] });
      })
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
      setDeletingIds(prev => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: "Success",
        description: "News deleted successfully",
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
        title: "Success",
        description: "News refreshed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh news",
        variant: "error"
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

  return (
    <div className="w-full px-2 sm:px-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex gap-3 w-full sm:w-auto">
          <RefreshButton 
            onRefresh={handleRefresh}
            isLoading={isLoading || isRefreshing}
            className="flex-1 sm:flex-none"
          />
          <Button
            onClick={() => setModalOpen(true)}
            className="flex gap-2 rounded-full flex-1 sm:flex-none"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add News</span>
            <span className="inline sm:hidden">Add</span>
          </Button>
        </div>
        <button
          onClick={() => exportNewsToCsv(news)}
          className="border border-orange-400 px-3 md:px-4 py-2 rounded-full bg-orange-50 text-orange-700 font-medium hover:bg-orange-200 transition text-sm w-full sm:w-auto sm:min-w-[120px]"
          disabled={news.length === 0}
        >
          Export CSV
        </button>
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
      ) : (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {news.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md border p-4">
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
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'Published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
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
                  {isDeleting(item.id) ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
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
