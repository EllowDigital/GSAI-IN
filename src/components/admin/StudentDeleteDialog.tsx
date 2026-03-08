import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface Props {
  student: any;
  onClose: () => void;
}

export default function StudentDeleteDialog({ student, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // All related data (fees, attendance, progress, promotions, competitions,
      // certificates, portal accounts) are automatically deleted via ON DELETE CASCADE
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);
      if (error) throw error;

      toast.success(
        `${student.name} and all related data permanently deleted.`
      );
      onClose();
    } catch (err: any) {
      toast.error('Error deleting student: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <AlertDialog open={!!student} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently Delete Student?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove{' '}
            <span className="font-semibold">{student.name}</span> and{' '}
            <span className="text-destructive font-medium">
              all related data
            </span>{' '}
            including: fees, attendance, progress, belt promotions, competition
            registrations, certificates, and portal account.
            <br />
            <br />
            <span className="font-semibold text-destructive">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-800"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
