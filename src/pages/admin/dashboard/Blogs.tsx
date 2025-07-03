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
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                <span>Blog Management</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Create, edit, and publish blog posts to share academy updates
                and insights.
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
                <span className="hidden sm:inline">Add Blog</span>
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
              onClick={() => exportBlogsToCsv(blogs)}
              disabled={blogs.length === 0}
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
                  Loading blog posts...
                </p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No blog posts found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Start creating engaging content for your academy blog.
                </p>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Post
                </Button>
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
              <div className="rounded-2xl shadow-sm overflow-x-auto bg-card border">
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
