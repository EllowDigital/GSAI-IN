import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List, BookMarked } from 'lucide-react';
import BlogEditorModal from '@/components/admin/BlogEditorModal';
import BlogsTable from '@/components/admin/blogs/BlogsTable';
import BlogsCards from '@/components/admin/blogs/BlogsCards';
import { exportBlogsToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/integrations/supabase/types';
import RefreshButton from '@/components/admin/RefreshButton';
import { toast } from '@/hooks/use-toast';

type Blog = Tables<'blogs'>;

export default function Blogs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('blogs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blogs' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['blogs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      setDeletingIds((prev) => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: 'Blog deleted successfully',
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

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingBlog(null);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    }, 100);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['blogs'] });
      await queryClient.refetchQueries({ queryKey: ['blogs'] });
      toast({
        title: 'Success',
        description: 'Blogs refreshed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh blogs',
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  return (
    <div className="w-full min-h-full p-2 sm:p-4 md:p-6">
      <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-none sm:rounded-2xl shadow-sm sm:shadow-lg border-0 sm:border border-slate-200/60 dark:border-slate-700/60">
        {/* Header with Icon and Title */}
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 items-start xs:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-500" />
            <span>Blog Manager</span>
          </h2>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 md:p-6 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-3 flex-wrap w-full lg:w-auto">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading || isRefreshing}
                className="flex-1 sm:flex-initial"
              />
              <Button
                onClick={() => setModalOpen(true)}
                className="flex gap-2 rounded-full flex-1 sm:flex-initial"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Blog</span>
                <span className="inline sm:hidden">Add</span>
              </Button>
            </div>

            <div className="flex gap-3 flex-wrap w-full lg:w-auto">
              <div className="flex gap-1 border rounded-full p-1 bg-gray-100 dark:bg-slate-800 flex-1 sm:flex-initial">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-full px-3"
                >
                  <Grid size={16} />
                  <span className="hidden sm:inline ml-1">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-full px-3"
                >
                  <List size={16} />
                  <span className="hidden sm:inline ml-1">Table</span>
                </Button>
              </div>
              <Button
                onClick={() => exportBlogsToCsv(blogs)}
                className="border border-blue-500 px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm"
                disabled={blogs.length === 0}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Blogs Content */}
          {isLoading || isRefreshing ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-400 rounded-full border-t-transparent" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No blogs found.
            </div>
          ) : viewMode === 'cards' ? (
            <BlogsCards
              blogs={blogs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isDeleting={isDeleting}
              formatDate={formatDate}
            />
          ) : (
            <div className="rounded-2xl shadow-inner overflow-x-auto bg-white dark:bg-slate-800">
              <BlogsTable
                blogs={blogs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                formatDate={formatDate}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <BlogEditorModal
        open={modalOpen}
        mode={editingBlog ? 'edit' : 'create'}
        blog={editingBlog}
        onClose={handleModalClose}
      />
    </div>
  );
}
