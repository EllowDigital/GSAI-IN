
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

  React.useEffect(() => {
    const channel = supabase
      .channel("blogs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blogs" },
        () => {
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
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const { toast } = useToast();

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
      toast({ title: "Error deleting blog", description: err.message, variant: "error" });
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

  // Responsive: use cards on mobile, table on md+
  const isMdUp = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

  // Utility: format date
  function formatDate(dt: string) {
    try {
      return new Date(dt).toLocaleDateString(undefined, { dateStyle: "medium" });
    } catch {
      return "--";
    }
  }

  // Responsive utility: cards for mobile, table for md+ screens
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="relative w-full max-w-6xl mx-auto py-2 px-1 xs:px-2 sm:px-4 md:px-6">
      {/* Topbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <h3 className="font-bold text-2xl xs:text-3xl text-yellow-500 font-montserrat mb-2 md:mb-0">Blog Manager</h3>
        <Button
          className="rounded-xl shadow-lg font-montserrat flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 text-sm xs:text-base"
          size="sm"
          onClick={() => setOpenModal({ mode: "create" })}
        >
          <Plus /> Add New Blog
        </Button>
      </div>

      {/* Table for md+ screens, Cards for mobile */}
      {isClient && window.innerWidth >= 768 ? (
        <Card className="rounded-2xl shadow-lg overflow-x-auto w-full">
          <CardContent className="p-0">
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right min-w-[110px]">Actions</TableHead>
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
                    <TableRow key={blog.id} className="hover:bg-yellow-50 transition">
                      <TableCell>
                        {blog.image_url ? (
                          <img
                            src={blog.image_url}
                            alt={blog.title}
                            className="h-14 w-24 object-cover rounded-lg shadow"
                            style={{ minWidth: "96px" }}
                          />
                        ) : (
                          <span className="italic text-gray-400">No Image</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold max-w-[140px] overflow-auto">
                        {blog.title}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {blog.published_at ? formatDate(blog.published_at) : "--"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate" title={blog.description}>
                        {blog.description}
                      </TableCell>
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
      ) : (
        <div className="grid xs:grid-cols-2 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 2 }).map((_, idx) => (
                <Card key={idx} className="rounded-xl shadow-lg animate-pulse h-52 flex flex-col gap-3 p-4">
                  <div className="h-28 bg-yellow-100 w-full rounded mb-2"></div>
                  <div className="h-6 bg-yellow-100 w-1/2 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 w-2/3 rounded mb-1"></div>
                </Card>
              ))
            : error ? (
                <div className="col-span-full text-red-500 mt-6">{error.message}</div>
              )
            : blogs && blogs.length > 0 ? (
                blogs.map((blog: any) => (
                  <Card key={blog.id} className="rounded-xl shadow-lg bg-white flex flex-col gap-3 p-4 relative">
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-28 xs:h-28 sm:h-32 object-cover rounded-md shadow mb-2"
                      />
                    ) : (
                      <div className="w-full h-28 xs:h-28 sm:h-32 bg-yellow-50 text-yellow-300 rounded-md flex items-center justify-center mb-2">No Image</div>
                    )}
                    <div className="flex items-start gap-2 justify-between mb-1 mt-1">
                      <div>
                        <div className="font-bold text-base leading-tight mb-0.5 text-gray-800 truncate">{blog.title}</div>
                        <div className="text-xs text-gray-500 mb-1">{blog.published_at ? formatDate(blog.published_at) : "--"}</div>
                        <div className="text-sm text-gray-700">{blog.description}</div>
                      </div>
                      <div className="flex flex-col gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full mb-2"
                          onClick={() => setOpenModal({ mode: "edit", blog })}
                          aria-label="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setConfirmDeleteId(blog.id)}
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
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-gray-400 mt-10 font-semibold text-center">No blog posts found.</div>
              )}
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      <BlogEditorModal
        open={!!openModal}
        mode={openModal?.mode ?? "create"}
        blog={openModal?.blog}
        onClose={() => setOpenModal(null)}
      />

      {/* Confirm Delete Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center py-4 px-2 xs:px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs xs:max-w-sm sm:max-w-md p-6 flex flex-col items-center">
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

// ... end of file
