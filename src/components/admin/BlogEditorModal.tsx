import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import BlogImageUploader from './BlogImageUploader';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;

type BlogForm = {
  title: string;
  description: string;
  content: string;
  image_url: string;
  published_at: string; // Must be string, e.g. '2024-06-14'
};

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  blog?: Blog;
  onClose(): void;
};

export default function BlogEditorModal({ open, mode, blog, onClose }: Props) {
  const queryClient = useQueryClient();

  const defaultValues: BlogForm = {
    title: blog?.title || '',
    description: blog?.description || '',
    content: blog?.content || '',
    image_url: blog?.image_url || '',
    published_at: blog?.published_at
      ? blog.published_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
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
      // Convert published_at to ISO string (Supabase expects string, not Date)
      const published_at_string =
        val.published_at.length === 10
          ? `${val.published_at}T00:00:00Z`
          : val.published_at;

      const { error } = await supabase.from('blogs').insert([
        {
          title: val.title,
          description: val.description,
          content: val.content,
          image_url: val.image_url,
          published_at: published_at_string,
          created_by: 'admin', // Optional: you can put current user email
        },
      ]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Blog created!' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: 'Error!', description: err.message, variant: 'error' });
    },
  });

  const updateBlog = useMutation({
    mutationFn: async (val: BlogForm) => {
      if (!blog?.id) throw new Error('No blog ID');

      // Convert published_at to ISO string properly
      const published_at_string =
        val.published_at.length === 10
          ? `${val.published_at}T00:00:00Z`
          : val.published_at;

      const { error } = await supabase
        .from('blogs')
        .update({
          title: val.title,
          description: val.description,
          content: val.content,
          image_url: val.image_url,
          published_at: published_at_string,
        })
        .eq('id', blog.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: 'Blog updated!' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: 'Error!', description: err.message, variant: 'error' });
    },
  });

  // Image URL for live preview
  const imgUrl = typeof window !== 'undefined' ? watchImage() || '' : '';

  function watchImage() {
    // Hacky because react-hook-form's "watch" doesn't trigger rerender by default
    return (
      (document.getElementById('blog-image-url') as HTMLInputElement)?.value ??
      ''
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">
              {mode === 'create' ? 'Create New Blog' : 'Edit Blog'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <form
              className="space-y-4 sm:space-y-5 pb-4 w-full font-montserrat"
              onSubmit={handleSubmit((data) => {
                mode === 'create'
                  ? createBlog.mutate(data)
                  : updateBlog.mutate(data);
              })}
            >
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Title
                </label>
                <Input
                  {...register('title', { required: 'Title is required' })}
                  disabled={isSubmitting}
                  placeholder="Blog title"
                  maxLength={100}
                  className="rounded-lg"
                  autoFocus
                />
                {errors.title && (
                  <span className="text-sm text-red-500 font-medium">
                    {errors.title.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Description
                </label>
                <Input
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  disabled={isSubmitting}
                  placeholder="Short description"
                  maxLength={220}
                  className="rounded-lg"
                />
                {errors.description && (
                  <span className="text-sm text-red-500 font-medium">
                    {errors.description.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Content
                </label>
                <Textarea
                  {...register('content', { required: 'Content is required' })}
                  disabled={isSubmitting}
                  placeholder="Full blog content"
                  rows={6}
                  className="rounded-lg resize-none"
                />
                {errors.content && (
                  <span className="text-sm text-red-500 font-medium">
                    {errors.content.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Blog Image
                </label>
                <BlogImageUploader
                  url={imgUrl || blog?.image_url || ''}
                  disabled={isSubmitting}
                  onUpload={(url) =>
                    setValue('image_url', url, { shouldValidate: true })
                  }
                />
                {/* Hidden input to track image_url */}
                <Input
                  id="blog-image-url"
                  type="hidden"
                  {...register('image_url', { required: 'Image is required' })}
                />
                {errors.image_url && (
                  <span className="text-sm text-red-500 font-medium">
                    {errors.image_url.message}
                  </span>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm sm:text-base">
                  Publish Date
                </label>
                <Input
                  type="date"
                  {...register('published_at', {
                    required: 'Publish date is required',
                  })}
                  disabled={isSubmitting}
                  className="rounded-lg"
                />
                {errors.published_at && (
                  <span className="text-sm text-red-500 font-medium">
                    {errors.published_at.message}
                  </span>
                )}
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl order-2 sm:order-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit((data) => {
                  mode === 'create'
                    ? createBlog.mutate(data)
                    : updateBlog.mutate(data);
                })}
                className="rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold order-1 sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin border-2 border-t-transparent border-black rounded-full w-4 h-4" />
                    Saving...
                  </span>
                ) : mode === 'create' ? (
                  'Create'
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
