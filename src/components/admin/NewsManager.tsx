import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Grid,
  List,
  Newspaper,
  AlertCircle,
  Search,
  Sparkles,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
} from 'lucide-react';
import NewsEditorModal from './NewsEditorModal';
import NewsDeleteDialog from './NewsDeleteDialog';
import { exportNewsToCsv } from '@/utils/exportToCsv';
import { Tables } from '@/services/supabase/types';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/useToast';
import { useNewsQuery } from '@/hooks/useEnhancedQuery';
import {
  formatErrorForDisplay,
  handleSupabaseError,
} from '@/utils/errorHandling';
import { supabase } from '@/services/supabase/client';
import { usePersistentState } from '@/hooks/usePersistentState';

type NewsRow = Tables<'news'>;

export default function NewsManager() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRow | null>(null);
  const [deleteNewsId, setDeleteNewsId] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Published' | 'Draft'>(
    'all'
  );
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );

  const queryClient = useQueryClient();

  // Enhanced data fetching
  const {
    data: news = [],
    isLoading,
    error,
    refresh: refreshNews,
  } = useNewsQuery();

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
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNews();
      toast({
        title: 'Success',
        description: 'News refreshed successfully',
      });
    } catch (error: any) {
      const appError = handleSupabaseError(error);
      toast({
        title: 'Error',
        description: appError.message,
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDeleting = (id: string) => deletingIds.has(id);

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const searchable = `${item.title || ''} ${item.short_description || ''}`.toLowerCase();
      const matchesSearch = searchQuery.trim()
        ? searchable.includes(searchQuery.toLowerCase().trim())
        : true;
      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [news, searchQuery, statusFilter]);

  const publishedCount = news.filter((item) => item.status === 'Published').length;
  const draftCount = news.filter((item) => item.status === 'Draft').length;

  const renderTableView = () => (
    <div className="admin-table-wrap">
      <table className="w-full min-w-[600px]">
        <thead className="bg-muted/50 border-b border-border/60">
          <tr>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Image
            </th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Title
            </th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </th>
            <th className="text-left p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Date
            </th>
            <th className="text-center p-4 font-semibold text-xs uppercase tracking-wide text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredNews.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <td className="p-4">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-16 h-12 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-16 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>
                )}
              </td>
              <td className="p-4">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.short_description}
                </p>
              </td>
              <td className="p-4">
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold ${
                    item.status === 'Published'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  }`}
                >
                  {item.status}
                </Badge>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {formatDate(item.created_at)}
              </td>
              <td className="p-4">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1.5 h-auto text-xs font-medium"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting(item.id)}
                    className="px-3 py-1.5 h-auto text-xs font-medium disabled:opacity-50"
                  >
                    {isDeleting(item.id) ? (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Deleting</span>
                      </span>
                    ) : (
                      'Delete'
                    )}
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
    <div className="admin-card-grid">
      {filteredNews.map((item) => (
        <Card
          key={item.id}
          className="border-border/70 bg-card transition-colors hover:bg-muted/20"
        >
          <CardContent className="p-0">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-36 w-full rounded-t-xl object-cover"
              />
            ) : (
              <div className="h-36 w-full rounded-t-xl bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No Image
              </div>
            )}
            <div className="space-y-3 p-4">
              <h3 className="line-clamp-2 font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {item.short_description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(item.created_at)}
                </span>
                <Badge
                  variant="outline"
                  className={
                    item.status === 'Published'
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                  }
                >
                  {item.status}
                </Badge>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="admin-page max-w-[1600px] space-y-5 lg:space-y-6">
      <section className="admin-panel overflow-hidden border-border/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-100 shadow-md">
        <div className="relative p-5 sm:p-6 lg:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-52 w-52 rounded-full bg-rose-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge className="w-fit gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-white/10">
                <Sparkles className="h-3.5 w-3.5" />
                Publishing Workspace
              </Badge>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  News Management
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
                  Create, schedule, and publish academy news with a cleaner
                  editorial workflow.
                </p>
              </div>
            </div>
            <div className="grid w-full gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[460px]">
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Total</p>
                  <p className="mt-1 text-2xl font-semibold">{isLoading ? '...' : news.length}</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Published</p>
                  <p className="mt-1 text-2xl font-semibold">{isLoading ? '...' : publishedCount}</p>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/10 text-slate-100">
                <CardContent className="p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-300">Drafts</p>
                  <p className="mt-1 text-2xl font-semibold">{isLoading ? '...' : draftCount}</p>
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
                <Newspaper className="w-5 h-5 text-primary" />
                <span>Editorial Operations</span>
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Maintain articles, update statuses, and keep public updates current.
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
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add News</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-panel-body">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Failed to load news</p>
                  <p className="text-sm mt-1">
                    {formatErrorForDisplay(error)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="border-destructive/30 hover:bg-destructive/10"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title or summary..."
                className="pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'Published' | 'Draft')
              }
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
            <div className="rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground sm:text-sm">
              Showing {filteredNews.length} of {news.length} articles
            </div>
          </div>

          <div className="admin-toolbar">
            <div className="admin-toggle flex-1 sm:flex-initial">
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
              onClick={() => exportNewsToCsv(filteredNews)}
              disabled={filteredNews.length === 0}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial min-w-[100px]"
            >
              Export CSV
            </Button>
          </div>

          <div className="w-full space-y-4">
            {isLoading || isRefreshing ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading news articles...
                </p>
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                  {news.length === 0 ? <Newspaper className="h-8 w-8" /> : <Clock3 className="h-8 w-8" />}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  {news.length === 0 ? 'No news articles found' : 'No results found'}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {news.length === 0
                    ? 'Get started by creating your first news article.'
                    : 'Try adjusting your search or status filter.'}
                </p>
                {news.length === 0 ? (
                  <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Article
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              renderCardsView()
            ) : (
              renderTableView()
            )}
          </div>
        </div>
      </div>

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
