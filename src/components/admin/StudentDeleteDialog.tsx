
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface Props {
  student: any;
  onClose: () => void;
}

export default function StudentDeleteDialog({ student, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", student.id);
      if (error) throw error;
      toast.success("Student deleted.");
      onClose();
    } catch (err: any) {
      toast.error("Error deleting student: " + err.message);
    }
    setLoading(false);
  };

  return (
    <AlertDialog open={!!student} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Student?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <span className="font-semibold">{student.name}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-800"
          >
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
