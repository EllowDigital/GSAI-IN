import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
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

  // Fetch blogs
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

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('blogs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw error;
    },
    onMutate: (id) => {
      setDeletingIds(prev => new Set(prev).add(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      toast({
        title: "Success",
        description: "Blog deleted successfully",
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
    // Auto-refresh after modal close
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
        title: "Success",
        description: "Blogs refreshed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to refresh blogs",
        variant: "error"
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
            <span className="hidden sm:inline">Add Blog</span>
            <span className="inline sm:hidden">Add</span>
          </Button>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
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
            onClick={() => exportBlogsToCsv(blogs)}
            className="border border-blue-400 px-3 md:px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-200 transition text-sm flex-1 lg:flex-none lg:min-w-[120px]"
            disabled={blogs.length === 0}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Content */}
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
        <div className="rounded-2xl shadow-lg overflow-x-auto bg-white">
          <BlogsTable
            blogs={blogs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            formatDate={formatDate}
          />
        </div>
      )}

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
