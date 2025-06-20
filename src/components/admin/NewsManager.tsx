
import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Delete, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NewsEditorModal from './NewsEditorModal';
import NewsDeleteDialog from './NewsDeleteDialog';
import { StatusBadge } from './StatusBadge';
import { toast } from '@/components/ui/sonner';

type News = {
  id: string;
  title: string;
  short_description: string;
  date: string;
  status: string;
  image_url?: string | null;
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

export default function NewsManager() {
  const [news, setNews] = React.useState<News[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorLoading, setEditorLoading] = React.useState(false);
  const [selectedNews, setSelectedNews] = React.useState<News | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [newsToDelete, setNewsToDelete] = React.useState<News | null>(null);

  // Filtering
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Fetch News
  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('id, title, short_description, date, status, image_url')
      .order('date', { ascending: false });
    if (error) {
      toast.error('Failed to fetch news.');
      setLoading(false);
      return;
    }
    setNews(data ?? []);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchNews();
    // Real-time updates
    const channel = supabase
      .channel('news-public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => fetchNews()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNews]);

  // Filtered display
  const displayedNews =
    statusFilter === 'all'
      ? news
      : news.filter((n) => n.status === statusFilter);

  // CRUD Handlers
  async function handleCreateOrUpdate(data: any) {
    setEditorLoading(true);
    try {
      if (selectedNews) {
        // Update
        const { error } = await supabase
          .from('news')
          .update({
            ...data,
          })
          .eq('id', selectedNews.id);
        if (error) throw error;
        toast.success('News updated successfully!');
      } else {
        // Create
        const { error } = await supabase.from('news').insert([{ ...data }]);
        if (error) throw error;
        toast.success('News created successfully!');
      }
      setEditorOpen(false);
      setSelectedNews(null);
    } catch (e: any) {
      toast.error('Failed: ' + e.message);
    } finally {
      setEditorLoading(false);
    }
  }

  async function handleDelete() {
    if (!newsToDelete) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsToDelete.id);
      if (error) throw error;
      toast.success('News deleted.');
      setDeleteOpen(false);
    } catch (e: any) {
      toast.error('Error deleting: ' + e.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openEditModal(item: News) {
    setSelectedNews(item);
    setEditorOpen(true);
  }

  function openDeleteDialog(item: News) {
    setNewsToDelete(item);
    setDeleteOpen(true);
  }

  function clearEditor() {
    setEditorOpen(false);
    setSelectedNews(null);
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-2 mb-8 px-2 sm:px-4 md:px-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="hidden sm:block"></div>
        <Button
          variant="default"
          size="lg"
          className="rounded-full font-montserrat shadow hover:scale-105 transition-transform w-full sm:w-auto px-6 md:px-8"
          onClick={() => {
            setSelectedNews(null);
            setEditorOpen(true);
          }}
        >
          + Add News
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6 items-start sm:items-center bg-yellow-50/80 py-3 px-4 rounded-xl shadow-sm border border-yellow-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-yellow-600 text-base">
            Filter:
          </span>
        </div>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            className={`${statusFilter === 'all' ? 'shadow' : ''} text-xs md:text-sm`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'Published' ? 'default' : 'secondary'}
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => setStatusFilter('Published')}
          >
            Published
          </Button>
          <Button
            variant={statusFilter === 'Draft' ? 'default' : 'secondary'}
            size="sm"
            className="text-xs md:text-sm"
            onClick={() => setStatusFilter('Draft')}
          >
            Draft
          </Button>
        </div>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-lg bg-white p-4 md:p-6 font-inter animate-pulse h-64 flex flex-col"
            >
              <div className="h-32 bg-yellow-100 w-full rounded mb-2"></div>
              <div className="h-6 bg-yellow-100 w-1/3 rounded mb-2"></div>
              <div className="h-4 bg-gray-100 w-2/3 rounded mb-1"></div>
            </div>
          ))
        ) : displayedNews.length === 0 ? (
          <div className="col-span-full text-gray-400 mt-10 font-semibold text-center">
            No news found.
          </div>
        ) : (
          displayedNews.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl shadow-lg bg-white flex flex-col font-inter transition group hover:scale-[1.02] hover:shadow-xl p-0 overflow-hidden"
            >
              <div className="relative w-full h-36 md:h-40 bg-yellow-50 flex justify-center items-center">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-200 group-hover:brightness-95"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-yellow-300 text-xl font-bold">
                      No Image
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-0.5 text-xs font-bold text-yellow-500 shadow">
                  {item.date ? formatDate(item.date) : '--'}
                </div>
              </div>
              <div className="flex-1 flex flex-col px-4 md:px-5 py-3 md:py-4 gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base md:text-lg line-clamp-2 flex-1">
                      {item.title}
                    </h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-xs md:text-sm text-gray-500">
                    {formatDate(item.date)}
                  </div>
                </div>
                <p className="text-gray-700 text-sm md:text-base line-clamp-3 flex-1">
                  {item.short_description}
                </p>
                <div className="flex gap-2 md:gap-3 mt-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full border h-8 w-8 md:h-9 md:w-9"
                    onClick={() => openEditModal(item)}
                    aria-label="Edit"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="rounded-full border h-8 w-8 md:h-9 md:w-9"
                    onClick={() => openDeleteDialog(item)}
                    aria-label="Delete"
                  >
                    <Delete className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <NewsEditorModal
        open={editorOpen}
        onOpenChange={(v) => {
          if (!editorLoading) clearEditor();
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={
          selectedNews
            ? {
                title: selectedNews.title,
                short_description: selectedNews.short_description,
                date: selectedNews.date,
                status: selectedNews.status,
                image_url: selectedNews.image_url ?? null,
              }
            : null
        }
        loading={editorLoading}
      />
      {/* Delete Dialog */}
      <NewsDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDelete={handleDelete}
        newsTitle={newsToDelete?.title || ''}
        loading={deleteLoading}
      />
    </div>
  );
}
