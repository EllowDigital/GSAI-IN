
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import NewsEditorModal from './NewsEditorModal';
import NewsDeleteDialog from './NewsDeleteDialog';
import { exportNewsToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/integrations/supabase/types';
import BlogsCards from './blogs/BlogsCards';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/use-toast';

type NewsRow = Tables<'news'>;

export default function NewsManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRow | null>(null);
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  
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
        variant: "destructive"
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

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['news'] });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  // Transform news to match blog structure for reusing BlogsCards
  const transformedNews = news.map(item => ({
    id: item.id,
    title: item.title,
    description: item.short_description || '',
    image_url: item.image_url,
    published_at: item.created_at,
  }));

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
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-orange-400 rounded-full border-t-transparent" />
        </div>
      ) : transformedNews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No news articles found.
        </div>
      ) : (
        <BlogsCards
          blogs={transformedNews}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          formatDate={formatDate}
        />
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
