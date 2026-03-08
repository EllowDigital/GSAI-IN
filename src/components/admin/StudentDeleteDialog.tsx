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
      const sid = student.id;

      // Delete all related data in parallel (order matters for FK constraints)
      // First: tables that reference students but have no further deps
      const deletions = await Promise.allSettled([
        supabase.from('competition_certificates').delete().eq('student_id', sid),
        supabase.from('competition_registrations').delete().eq('student_id', sid),
        supabase.from('fees').delete().eq('student_id', sid),
        supabase.from('student_progress').delete().eq('student_id', sid),
        supabase.from('student_discipline_progress').delete().eq('student_id', sid),
        supabase.from('promotion_history').delete().eq('student_id', sid),
      ]);

      // Check for errors in related deletions
      for (const result of deletions) {
        if (result.status === 'fulfilled' && result.value?.error) {
          console.warn('Related data deletion warning:', result.value.error.message);
        }
      }

      // Delete portal account (has FK to students)
      await supabase.from('student_portal_accounts').delete().eq('student_id', sid);

      // Finally delete the student record
      const { error } = await supabase.from('students').delete().eq('id', sid);
      if (error) throw error;

      toast.success(`${student.name} and all related data permanently deleted.`);
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
            <span className="text-destructive font-medium">all related data</span> including:
            fees, progress, belt promotions, competition registrations, certificates, and portal account.
            <br /><br />
            <span className="font-semibold text-destructive">This action cannot be undone.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-800"
          >
            {loading ? 'Deleting Everything...' : 'Delete Permanently'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
