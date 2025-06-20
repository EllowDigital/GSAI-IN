
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
        const { error } = await supabase
          .from('news')
          .insert([newsData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast({
        title: "Success",
        description: editingNews ? "News updated successfully" : "News created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "error"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingNews ? 'Edit News' : 'Add News'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <Input
              {...register('title', { required: requiredMsg })}
              disabled={mutation.isPending}
            />
            {errors.title && (
              <div className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Short Description</label>
            <Input
              {...register('short_description', { required: requiredMsg })}
              disabled={mutation.isPending}
            />
            {errors.short_description && (
              <div className="text-red-500 text-xs mt-1">
                {errors.short_description.message}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <Input
              type="date"
              {...register('date', { required: requiredMsg })}
              disabled={mutation.isPending}
            />
            {errors.date && (
              <div className="text-red-500 text-xs mt-1">
                {errors.date.message}
              </div>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              {...register('status', { required: requiredMsg })}
              className="border rounded-md px-2 py-1 w-full"
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
            <label className="block mb-1 font-medium">Image</label>
            <NewsImageUploader
              imageUrl={imageUrl}
              onUpload={setImageUrl}
              disabled={mutation.isPending}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="secondary" type="button" disabled={mutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="default" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <span className="animate-spin inline-block w-4 h-4 border-t-2 border-white border-solid rounded-full mr-2" />
              ) : null}
              {editingNews ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
