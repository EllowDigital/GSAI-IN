
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import BlogImageUploader from "./BlogImageUploader";

type BlogForm = {
  title: string;
  description: string;
  content: string;
  image_url: string;
  published_at: string;
};

type Props = {
  open: boolean;
  mode: "create" | "edit";
  blog?: any;
  onClose(): void;
};

export default function BlogEditorModal({ open, mode, blog, onClose }: Props) {
  const queryClient = useQueryClient();

  const defaultValues: BlogForm = {
    title: blog?.title || "",
    description: blog?.description || "",
    content: blog?.content || "",
    image_url: blog?.image_url || "",
    published_at: blog?.published_at
      ? blog.published_at.split("T")[0]
      : new Date().toISOString().split("T")[0],
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogForm>({
    defaultValues,
  });

  React.useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line
  }, [blog, open]);

  // Mutations
  const createBlog = useMutation({
    mutationFn: async (val: BlogForm) => {
      const { error } = await supabase
        .from("blogs")
        .insert([
          {
            title: val.title,
            description: val.description,
            content: val.content,
            image_url: val.image_url,
            published_at: new Date(val.published_at),
            created_by: "admin", // Optional: you can put current user email
          },
        ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Blog created!" });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error!", description: err.message, variant: "destructive" });
    },
  });

  const updateBlog = useMutation({
    mutationFn: async (val: BlogForm) => {
      if (!blog?.id) throw new Error("No blog ID");
      const { error } = await supabase
        .from("blogs")
        .update({
          title: val.title,
          description: val.description,
          content: val.content,
          image_url: val.image_url,
          published_at: new Date(val.published_at),
        })
        .eq("id", blog.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Blog updated!" });
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error!", description: err.message, variant: "destructive" });
    },
  });

  // Image URL for live preview
  const imgUrl = typeof window !== "undefined"
    ? (watchImage() || "")
    : "";

  function watchImage() {
    // Hacky because react-hook-form's "watch" doesn't trigger rerender by default
    return (document.getElementById("blog-image-url") as HTMLInputElement)?.value ?? "";
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Blog" : "Edit Blog"}
          </DialogTitle>
        </DialogHeader>
        <form
          className="space-y-5 w-full max-w-lg mx-auto font-montserrat"
          onSubmit={handleSubmit((data) => {
            mode === "create"
              ? createBlog.mutate(data)
              : updateBlog.mutate(data);
          })}
        >
          <div>
            <label className="block font-semibold mb-1">Title</label>
            <Input
              {...register("title", { required: "Title is required" })}
              disabled={isSubmitting}
              placeholder="Blog title"
              maxLength={100}
              className="rounded-lg"
              autoFocus
            />
            {errors.title && <span className="text-sm text-red-500 font-medium">{errors.title.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Description</label>
            <Input
              {...register("description", { required: "Description is required" })}
              disabled={isSubmitting}
              placeholder="Short description"
              maxLength={220}
              className="rounded-lg"
            />
            {errors.description && <span className="text-sm text-red-500 font-medium">{errors.description.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Content</label>
            <Textarea
              {...register("content", { required: "Content is required" })}
              disabled={isSubmitting}
              placeholder="Full blog content"
              rows={6}
              className="rounded-lg"
            />
            {errors.content && <span className="text-sm text-red-500 font-medium">{errors.content.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Blog Image</label>
            <BlogImageUploader
              url={imgUrl || blog?.image_url || ""}
              disabled={isSubmitting}
              onUpload={(url) => setValue("image_url", url, { shouldValidate: true })}
            />
            {/* Hidden input to track image_url */}
            <Input
              id="blog-image-url"
              type="hidden"
              {...register("image_url", { required: "Image is required" })}
            />
            {errors.image_url && <span className="text-sm text-red-500 font-medium">{errors.image_url.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Publish Date</label>
            <Input
              type="date"
              {...register("published_at", { required: "Publish date is required" })}
              disabled={isSubmitting}
              className="rounded-lg"
            />
            {errors.published_at && <span className="text-sm text-red-500 font-medium">{errors.published_at.message}</span>}
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? <span className="flex items-center gap-2"><span className="animate-spin border-2 border-t-transparent border-black rounded-full w-4 h-4" />Saving...</span>
                : (
                  mode === "create" ? "Create" : "Update"
                )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
