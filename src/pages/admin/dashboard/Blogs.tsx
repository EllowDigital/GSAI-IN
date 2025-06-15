import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BlogEditorModal from '@/components/admin/BlogEditorModal';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import BlogsTable from '@/components/admin/blogs/BlogsTable';
import BlogsCards from '@/components/admin/blogs/BlogsCards';
import BlogDeleteConfirmationDialog from '@/components/admin/blogs/BlogDeleteConfirmationDialog';

type Blog = Tables<'blogs'>;

function useBlogs() {
  const queryClient = useQueryClient();

  React.useEffect(() => {
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

  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export default function Blogs() {
  const { data: blogs, isLoading, error } = useBlogs();
  const [openModal, setOpenModal] = React.useState<null | {
    mode: 'create' | 'edit';
    blog?: Blog;
  }>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      const { error } = await supabase.from('blogs').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Blog deleted' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error deleting blog',
        description: err.message,
        variant: 'error',
      });
    },
    onSettled: () => {
      setDeletingId(null);
      setConfirmDeleteId(null);
    },
  });

  const [showBackTop, setShowBackTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 200);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  function formatDate(dt: string | null) {
    if (!dt) return '--';
    try {
      return new Date(dt).toLocaleDateString(undefined, {
        dateStyle: 'medium',
      });
    } catch {
      return '--';
    }
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteBlogMutation.mutate(confirmDeleteId);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-400 rounded-full border-t-transparent" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="col-span-full text-red-500 mt-6">{error.message}</div>
      );
    }

    if (!blogs || blogs.length === 0) {
      return (
        <div className="col-span-full text-gray-400 mt-10 font-semibold text-center">
          No blog posts found.
        </div>
      );
    }

    const isMdUp = isClient && window.innerWidth >= 768;

    return isMdUp ? (
      <Card className="rounded-2xl shadow-lg overflow-x-auto w-full">
        <CardContent className="p-0">
          <BlogsTable
            blogs={blogs}
            onEdit={(blog) => setOpenModal({ mode: 'edit', blog })}
            onDelete={(id) => setConfirmDeleteId(id)}
            isDeleting={(id) => deletingId === id}
            formatDate={formatDate}
          />
        </CardContent>
      </Card>
    ) : (
      <BlogsCards
        blogs={blogs}
        onEdit={(blog) => setOpenModal({ mode: 'edit', blog })}
        onDelete={(id) => setConfirmDeleteId(id)}
        isDeleting={(id) => deletingId === id}
        formatDate={formatDate}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
          <BookOpen className="w-7 h-7" /> Blog Management
        </h2>
        <Button
          className="rounded-xl shadow-lg flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 text-sm xs:text-base w-full sm:w-auto"
          size="sm"
          onClick={() => setOpenModal({ mode: 'create' })}
        >
          <Plus /> Add New Blog
        </Button>
      </div>

      {renderContent()}

      <BlogEditorModal
        open={!!openModal}
        mode={openModal?.mode ?? 'create'}
        blog={openModal?.blog}
        onClose={() => setOpenModal(null)}
      />

      <BlogDeleteConfirmationDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteBlogMutation.isPending}
      />

      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-xl p-3 z-40"
          aria-label="Back to Top"
        >
          <ArrowUp className="text-black" />
        </button>
      )}
    </div>
  );
}
