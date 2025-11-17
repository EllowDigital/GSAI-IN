import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import NewsImageUploader from './NewsImageUploader';
import { Tables } from '@/integrations/supabase/types';

type NewsRow = Tables<'news'>;

type NewsEditorForm = {
  title: string;
  short_description: string;
  date: string;
  status: string;
  image_url?: string | null;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editingNews?: NewsRow | null;
};

const requiredMsg = 'This field is required';

export default function NewsEditorModal({
  open,
  onOpenChange,
  editingNews,
}: Props) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsEditorForm>({
    defaultValues: {
      title: '',
      short_description: '',
      date: '',
      status: 'Draft',
      image_url: null,
    },
  });

  const [imageUrl, setImageUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editingNews) {
      reset({
        title: editingNews.title,
        short_description: editingNews.short_description,
        date: editingNews.date,
        status: editingNews.status,
        image_url: editingNews.image_url,
      });
      setImageUrl(editingNews.image_url);
    } else {
      reset({
        title: '',
        short_description: '',
        date: '',
        status: 'Draft',
        image_url: null,
      });
      setImageUrl(null);
    }
  }, [editingNews, open, reset]);

  const mutation = useMutation({
    mutationFn: async (data: NewsEditorForm) => {
      const newsData = {
        ...data,
        image_url: imageUrl,
      };

      if (editingNews) {
        const { error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', editingNews.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([newsData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: 'Success',
        description: editingNews
          ? 'News updated successfully'
          : 'News created successfully',
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'error',
      });
    },
  });

  async function onFormSubmit(data: NewsEditorForm) {
    mutation.mutate(data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!mutation.isPending) onOpenChange(open);
      }}
    >
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">
              {editingNews ? 'Edit News' : 'Add News'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Manage the headline, summary, schedule, status, and cover image
              used on the public news pages.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <form
              onSubmit={handleSubmit(onFormSubmit)}
              className="space-y-4 sm:space-y-5 pb-4"
            >
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base">
                  Title
                </label>
                <Input
                  {...register('title', { required: requiredMsg })}
                  disabled={mutation.isPending}
                  placeholder="News title"
                  className="rounded-lg"
                />
                {errors.title && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base">
                  Short Description
                </label>
                <Input
                  {...register('short_description', { required: requiredMsg })}
                  disabled={mutation.isPending}
                  placeholder="Brief description"
                  className="rounded-lg"
                />
                {errors.short_description && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.short_description.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base">
                  Date
                </label>
                <Input
                  type="date"
                  {...register('date', { required: requiredMsg })}
                  disabled={mutation.isPending}
                  className="rounded-lg"
                />
                {errors.date && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.date.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base">
                  Status
                </label>
                <select
                  {...register('status', { required: requiredMsg })}
                  className="border rounded-lg px-3 py-2 w-full bg-background"
                  disabled={mutation.isPending}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
                {errors.status && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors.status.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm sm:text-base">
                  Image
                </label>
                <NewsImageUploader
                  imageUrl={imageUrl}
                  onUpload={setImageUrl}
                  disabled={mutation.isPending}
                />
              </div>
            </form>
          </div>

          <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <DialogClose asChild>
                <Button
                  variant="secondary"
                  type="button"
                  disabled={mutation.isPending}
                  className="rounded-xl order-2 sm:order-1"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="default"
                type="submit"
                onClick={handleSubmit(onFormSubmit)}
                disabled={mutation.isPending}
                className="rounded-xl order-1 sm:order-2"
              >
                {mutation.isPending ? (
                  <span className="animate-spin inline-block w-4 h-4 border-t-2 border-white border-solid rounded-full mr-2" />
                ) : null}
                {editingNews ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
