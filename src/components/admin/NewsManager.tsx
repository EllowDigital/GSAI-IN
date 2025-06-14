
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsEditorModal from "./NewsEditorModal";
import NewsDeleteDialog from "./NewsDeleteDialog";
import { StatusBadge } from "./StatusBadge";
import { toast } from "@/components/ui/sonner";

type News = {
  id: string;
  title: string;
  short_description: string;
  date: string;
  status: string;
};

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString(undefined, { dateStyle: "medium" });
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
  const [statusFilter, setStatusFilter] = React.useState("all");

  // Fetch News
  const fetchNews = React.useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("news")
      .select("id, title, short_description, date, status")
      .order("date", { ascending: false });
    if (error) {
      toast.error("Failed to fetch news.");
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
      .channel("news-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "news" }, () => fetchNews())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNews]);

  // Filtered display
  const displayedNews =
    statusFilter === "all"
      ? news
      : news.filter(n => n.status === statusFilter);

  // CRUD Handlers
  async function handleCreateOrUpdate(data: any) {
    setEditorLoading(true);
    try {
      if (selectedNews) {
        // Update
        const { error } = await supabase
          .from("news")
          .update({
            ...data
          })
          .eq("id", selectedNews.id);
        if (error) throw error;
        toast.success("News updated successfully!");
      } else {
        // Create
        const { error } = await supabase.from("news").insert([{ ...data }]);
        if (error) throw error;
        toast.success("News created successfully!");
      }
      setEditorOpen(false);
      setSelectedNews(null);
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    } finally {
      setEditorLoading(false);
    }
  }

  async function handleDelete() {
    if (!newsToDelete) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from("news").delete().eq("id", newsToDelete.id);
      if (error) throw error;
      toast.success("News deleted.");
      setDeleteOpen(false);
    } catch (e: any) {
      toast.error("Error deleting: " + e.message);
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
    <div className="w-full max-w-5xl mx-auto mt-2">
      <div className="flex flex-col xs:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl xs:text-3xl font-bold mb-4 xs:mb-0 text-yellow-400 font-montserrat">🗞️ News Manager</h2>
        <Button
          variant="default"
          className="rounded-full font-montserrat xs:ml-4"
          onClick={() => { setSelectedNews(null); setEditorOpen(true); }}
        >
          + Add News
        </Button>
      </div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={statusFilter === "all" ? "default" : "secondary"}
          size="sm"
          onClick={() => setStatusFilter("all")}
          className={statusFilter === "all" ? "shadow" : ""}
        >
          All
        </Button>
        <Button
          variant={statusFilter === "Published" ? "default" : "secondary"}
          size="sm"
          onClick={() => setStatusFilter("Published")}
        >
          Published
        </Button>
        <Button
          variant={statusFilter === "Draft" ? "default" : "secondary"}
          size="sm"
          onClick={() => setStatusFilter("Draft")}
        >
          Draft
        </Button>
      </div>
      {/* News List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading
          ? Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl shadow-lg bg-white p-6 font-inter animate-pulse h-44"
              >
                <div className="h-6 bg-yellow-100 w-1/3 rounded mb-2"></div>
                <div className="h-4 bg-gray-100 w-2/3 rounded mb-1"></div>
                <div className="h-4 bg-gray-100 w-1/2 rounded"></div>
              </div>
            ))
          : displayedNews.length === 0
          ? (
            <div className="col-span-full text-gray-400 mt-10 font-semibold text-center">No news found.</div>
          )
          : displayedNews.map(item => (
              <div
                key={item.id}
                className="rounded-2xl shadow-lg bg-white p-6 font-inter flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-sm text-gray-500 mb-2">{formatDate(item.date)}</div>
                <div className="text-sm text-gray-700 flex-1">{item.short_description}</div>
                <div className="flex gap-3 mt-3">
                  <Button size="icon" variant="secondary" onClick={() => openEditModal(item)} aria-label="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => openDeleteDialog(item)} aria-label="Delete">
                    <Delete className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
      </div>
      {/* Modals */}
      <NewsEditorModal
        open={editorOpen}
        onOpenChange={v => { if (!editorLoading) clearEditor(); }}
        onSubmit={handleCreateOrUpdate}
        initialData={
          selectedNews
            ? {
                title: selectedNews.title,
                short_description: selectedNews.short_description,
                date: selectedNews.date,
                status: selectedNews.status,
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
        newsTitle={newsToDelete?.title || ""}
        loading={deleteLoading}
      />
    </div>
  );
}
