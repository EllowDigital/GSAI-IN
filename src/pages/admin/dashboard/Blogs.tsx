
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ArrowUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import BlogEditorModal from "@/components/admin/BlogEditorModal";
import { useToast, toast } from "@/hooks/use-toast";

function useBlogs() {
  const queryClient = useQueryClient();

  // Subscribe to realtime updates for blogs
  React.useEffect(() => {
    const channel = supabase
      .channel("blogs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blogs" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["blogs"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

export default function Blogs() {
  const { data: blogs, isLoading, error } = useBlogs();
  const [openModal, setOpenModal] = React.useState<null | {
    mode: "create" | "edit";
    blog?: any;
  }>(null);
  const [deleting, setDeleting] = React.useState<string | null>(null); // blog id being deleted
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(
    null
  );
  const { toast } = useToast();

  // CRUD Mutations
  const queryClient = useQueryClient();
  const deleteBlogMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Blog deleted" });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setDeleting(null);
      setConfirmDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error deleting blog", description: err.message, variant: "destructive" });
      setDeleting(null);
      setConfirmDeleteId(null);
    },
  });

  // Back to Top Button
  const [showBackTop, setShowBackTop] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 200);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto py-2">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <h3 className="font-bold text-2xl text-yellow-500 font-montserrat">
          Blog Manager
        </h3>
        <Button
          className="rounded-2xl shadow-lg font-montserrat flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2"
          size="sm"
          onClick={() => setOpenModal({ mode: "create" })}
        >
          <Plus /> Add New Blog
        </Button>
      </div>
      <Card className="rounded-2xl shadow-lg overflow-x-auto">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex justify-center p-6">
                      <div className="animate-spin h-8 w-8 border-4 border-yellow-400 rounded-full border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-red-500">
                    {error.message}
                  </TableCell>
                </TableRow>
              ) : blogs && blogs.length > 0 ? (
                blogs.map((blog: any) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      {blog.image_url ? (
                        <img
                          src={blog.image_url}
                          alt={blog.title}
                          className="h-14 w-24 object-cover rounded-lg shadow"
                        />
                      ) : (
                        <span className="italic text-muted-foreground">No Image</span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold max-w-[140px] overflow-x-auto">
                      {blog.title}
                    </TableCell>
                    <TableCell>
                      {blog.published_at
                        ? new Date(blog.published_at).toLocaleDateString()
                        : "--"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{blog.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setOpenModal({ mode: "edit", blog })
                          }
                          className="rounded-full"
                          aria-label="Edit"
                        >
                          <Edit />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setConfirmDeleteId(blog.id)}
                          className="rounded-full"
                          aria-label="Delete"
                          disabled={deleting === blog.id}
                        >
                          {deleting === blog.id ? (
                            <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4" />
                          ) : (
                            <Trash2 />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No blog posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Blog Modal */}
      <BlogEditorModal
        open={!!openModal}
        mode={openModal?.mode ?? "create"}
        blog={openModal?.blog}
        onClose={() => setOpenModal(null)}
      />

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 flex flex-col items-center">
            <div className="font-semibold text-lg mb-2 text-red-500">Delete Blog?</div>
            <div className="mb-6 text-center text-sm text-muted-foreground">
              Are you sure you want to delete this blog post? This is permanent.
            </div>
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1 rounded-xl"
                onClick={() => {
                  setDeleting(confirmDeleteId);
                  deleteBlogMutation.mutate(confirmDeleteId);
                }}
                disabled={deleting === confirmDeleteId}
              >
                {deleting === confirmDeleteId ? (
                  <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4 mx-auto" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-yellow-400 hover:bg-yellow-300 rounded-full shadow-xl p-3 z-40"
          aria-label="Back to Top"
        >
          <ArrowUp className="text-black" />
        </button>
      )}
    </div>
  );
}
