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
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  student: any;
  onClose: () => void;
}

export default function StudentDeleteDialog({ student, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      // All related data (fees, attendance, progress, promotions, competitions,
      // certificates, portal accounts, programs, belt exam notifications,
      // discipline progress) are automatically deleted via ON DELETE CASCADE
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);
      if (error) throw error;

      toast.success(
        `${student.name} and all related data permanently deleted.`
      );

      // Invalidate ALL related queries to keep UI in sync
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({
        queryKey: ['discipline-progress-admin'],
      });
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['promotion-history'] });
      queryClient.invalidateQueries({ queryKey: ['students-portal-status'] });
      queryClient.invalidateQueries({ queryKey: ['portal-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['belt-exam-notifications'] });
      queryClient.invalidateQueries({
        queryKey: ['competition-registrations'],
      });
      queryClient.invalidateQueries({ queryKey: ['competition-certificates'] });

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
            registrations, certificates, portal account, programs, and exam
            notifications.
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
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
