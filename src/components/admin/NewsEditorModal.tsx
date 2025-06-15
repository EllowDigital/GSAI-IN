import React from 'react';
import { useForm } from 'react-hook-form';
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
import { toast } from '@/components/ui/sonner';
import NewsImageUploader from './NewsImageUploader';

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
  onSubmit: (data: NewsEditorForm) => Promise<void>;
  initialData?: NewsEditorForm | null;
  loading: boolean;
};

const requiredMsg = 'This field is required';

export default function NewsEditorModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  loading,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsEditorForm>({
    defaultValues: initialData ?? {
      title: '',
      short_description: '',
      date: '',
      status: 'Draft',
      image_url: null,
    },
  });

  const [imageUrl, setImageUrl] = React.useState<string | null>(
    initialData?.image_url ?? null
  );

  React.useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImageUrl(initialData.image_url ?? null);
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
  }, [initialData, open, reset]);

  async function onFormSubmit(data: NewsEditorForm) {
    await onSubmit({ ...data, image_url: imageUrl ?? null });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!loading) onOpenChange(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit News' : 'Add News'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-2">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <Input
              {...register('title', { required: requiredMsg })}
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button variant="secondary" type="button" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="default" type="submit" disabled={loading}>
              {loading ? (
                <span className="animate-spin inline-block w-4 h-4 border-t-2 border-white border-solid rounded-full mr-2" />
              ) : null}
              {initialData ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
