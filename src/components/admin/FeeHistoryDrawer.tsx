import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/services/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/useToast';
import FeeEditModal from './FeeEditModal';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export default function FeeHistoryDrawer({
  open,
  onClose,
  student,
  allFees,
}: {
  open: boolean;
  onClose: () => void;
  student: any;
  allFees: any[];
}) {
  const queryClient = useQueryClient();
  const [editFee, setEditFee] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const rows = (allFees || [])
    .filter((f) => f.student_id === student?.id)
    .sort((a, b) => (b.year !== a.year ? b.year - a.year : b.month - a.month));

  const handleEdit = (fee: any) => {
    setEditFee(fee);
    setEditModalOpen(true);
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditFee(null);
    queryClient.invalidateQueries({ queryKey: ['fees'] });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('fees').delete().eq('id', deleteId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast({
        title: 'Deleted',
        description: 'Fee record removed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: getFriendlySupabaseMessage(
          err,
          'Failed to delete fee record'
        ),
        variant: 'error',
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📋 Fee History — {student?.name}
            </DialogTitle>
            <DialogDescription>
              View, edit, or delete past fee records. Most recent first.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[450px] overflow-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs">Month</TableHead>
                  <TableHead className="text-xs">Program</TableHead>
                  <TableHead className="text-xs">Fee</TableHead>
                  <TableHead className="text-xs">Paid</TableHead>
                  <TableHead className="text-xs">Balance</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Receipt</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      No payment history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((fee) => (
                    <TableRow key={fee.id} className="group hover:bg-muted/30">
                      <TableCell className="text-xs font-medium">
                        {MONTH_NAMES[fee.month - 1]} {fee.year}
                      </TableCell>
                      <TableCell className="text-xs">
                        {fee.program_name || 'General'}
                      </TableCell>
                      <TableCell className="text-xs">
                        ₹{fee.monthly_fee?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-green-700">
                        ₹{fee.paid_amount?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell
                        className={`text-xs font-medium ${fee.balance_due > 0 ? 'text-destructive' : 'text-green-700'}`}
                      >
                        ₹{fee.balance_due?.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            fee.status === 'paid'
                              ? 'bg-green-100 text-green-700 border-green-200'
                              : fee.status === 'partial'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                          }`}
                        >
                          {fee.status === 'paid' && '✅ '}
                          {fee.status === 'partial' && '⚠️ '}
                          {fee.status === 'unpaid' && '❌ '}
                          {fee.status?.charAt(0).toUpperCase() +
                            fee.status?.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {fee.receipt_url ? (
                          <a
                            href={fee.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline text-xs hover:text-primary/80"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className="max-w-[120px] truncate text-xs text-muted-foreground"
                        title={fee.notes ?? ''}
                      >
                        {fee.notes || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleEdit(fee)}
                            title="Edit this record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(fee.id)}
                            title="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {rows.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 text-xs text-muted-foreground">
              <span>
                {rows.length} record{rows.length !== 1 ? 's' : ''}
              </span>
              <span>
                Total paid: ₹
                {rows
                  .reduce((sum, f) => sum + (f.paid_amount || 0), 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      {editModalOpen && editFee && (
        <FeeEditModal
          open={editModalOpen}
          onClose={handleEditClose}
          student={student}
          fee={editFee}
          month={editFee.month}
          year={editFee.year}
          programName={editFee.program_name || 'General'}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this fee record. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
