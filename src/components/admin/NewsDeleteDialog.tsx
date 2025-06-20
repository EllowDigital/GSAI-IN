
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
};

export default function NewsDeleteDialog({
  open,
  onClose,
  onConfirm,
  isDeleting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={() => !isDeleting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete News</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this news article? This action cannot be undone.
        </DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="animate-spin inline-block w-4 h-4 border-t-2 border-white border-solid rounded-full mr-2" />
            ) : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
