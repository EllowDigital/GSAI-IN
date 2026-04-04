import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Grid,
  List,
  BookMarked,
  Sparkles,
  Search,
  CalendarDays,
  Clock3,
} from 'lucide-react';
import BlogEditorModal from '@/components/admin/BlogEditorModal';
import BlogsTable from '@/components/admin/blogs/BlogsTable';
import BlogsCards from '@/components/admin/blogs/BlogsCards';
import { exportBlogsToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/services/supabase/types';
import RefreshButton from '@/components/admin/RefreshButton';
import { toast } from '@/hooks/useToast';
import { usePersistentState } from '@/hooks/usePersistentState';

type Blog = Tables<'blogs'>;

export default function Blogs() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );
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
    queryClient.invalidateQueries({ queryKey: ['blogs'] });
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

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const searchable =
        `${blog.title || ''} ${blog.description || ''} ${blog.content || ''}`.toLowerCase();
      return searchQuery.trim()
        ? searchable.includes(searchQuery.toLowerCase().trim())
        : true;
    });
  }, [blogs, searchQuery]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return blogs.filter((blog) => {
      if (!blog.published_at) return false;
      const published = new Date(blog.published_at);
      return (
        published.getFullYear() === now.getFullYear() &&
        published.getMonth() === now.getMonth()
      );
    }).length;
  }, [blogs]);

  return (
    <div className="admin-page space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-orange-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Editorial Workspace
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Blog Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Create, refine, and publish academy stories in a cleaner,
                  faster writing workflow.
                </p>
              </div>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Total Posts
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : blogs.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    This Month
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {isLoading ? '...' : thisMonthCount}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Filtered
                  </p>
                  <p className="mt-1 text-2xl font-semibold">
                    {filteredBlogs.length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <div className="admin-panel">
        <div className="admin-panel-header">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-foreground">
                <BookMarked className="w-5 h-5 text-primary" />
                <span>Blog Operations</span>
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage posts, switch views, and maintain high-quality content
                flow.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading || isRefreshing}
                className="flex-shrink-0"
              />
              <Button
                onClick={() => {
                  setEditingBlog(null);
                  setModalOpen(true);
                }}
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Blog</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-panel-body">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, summary, or content..."
                className="pl-9"
              />
            </div>

            <div className="admin-toggle flex-1 sm:flex-initial justify-self-start">
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
              onClick={() => exportBlogsToCsv(filteredBlogs)}
              disabled={filteredBlogs.length === 0}
              variant="outline"
              size="sm"
              className="justify-self-start"
            >
              Export CSV
            </Button>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Showing {filteredBlogs.length} of {blogs.length} posts
            </span>
          </div>

          <div className="admin-toolbar">
            <div />
          </div>

          <div className="w-full space-y-4">
            {isLoading || isRefreshing ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading blog posts...
                </p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Clock3 className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  {blogs.length === 0
                    ? 'No blog posts found'
                    : 'No matching blog posts'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {blogs.length === 0
                    ? 'Start creating engaging content for your academy blog.'
                    : 'Try changing your search query.'}
                </p>
                {blogs.length === 0 ? (
                  <Button
                    onClick={() => {
                      setEditingBlog(null);
                      setModalOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Post
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Reset Search
                  </Button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              <BlogsCards
                blogs={filteredBlogs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={isDeleting}
                formatDate={formatDate}
              />
            ) : (
              <div className="rounded-2xl shadow-sm overflow-x-auto bg-card border">
                <BlogsTable
                  blogs={filteredBlogs}
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
