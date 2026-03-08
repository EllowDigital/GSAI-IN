import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useCallback } from 'react';

export type StudentProgram = {
  id: string;
  student_id: string;
  program_name: string;
  joined_at: string;
  is_primary: boolean;
  created_at: string;
};

export function useStudentPrograms(studentId?: string) {
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['student-programs', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await supabase
        .from('student_programs')
        .select('*')
        .eq('student_id', studentId)
        .order('is_primary', { ascending: false });
      if (error) throw error;
      return (data || []) as StudentProgram[];
    },
    enabled: !!studentId,
  });

  const addProgram = useCallback(async (studentId: string, programName: string, joinDate?: string) => {
    const { error } = await supabase.from('student_programs').insert({
      student_id: studentId,
      program_name: programName,
      joined_at: joinDate || new Date().toISOString().slice(0, 10),
      is_primary: false,
    });
    if (error) {
      if (error.code === '23505') {
        toast.error(`Student is already enrolled in ${programName}`);
      } else {
        toast.error('Failed to add program: ' + error.message);
      }
      return false;
    }
    queryClient.invalidateQueries({ queryKey: ['student-programs'] });
    queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
    toast.success(`Added ${programName} program`);
    return true;
  }, [queryClient]);

  const removeProgram = useCallback(async (programId: string) => {
    const { error } = await supabase.from('student_programs').delete().eq('id', programId);
    if (error) {
      toast.error('Failed to remove program: ' + error.message);
      return false;
    }
    queryClient.invalidateQueries({ queryKey: ['student-programs'] });
    queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
    toast.success('Program removed');
    return true;
  }, [queryClient]);

  return { programs, isLoading, addProgram, removeProgram };
}

// Bulk fetch all student programs for list views
export function useAllStudentPrograms(studentIds: string[]) {
  return useQuery({
    queryKey: ['all-student-programs', studentIds.sort().join(',')],
    queryFn: async () => {
      if (studentIds.length === 0) return new Map<string, string[]>();
      const { data, error } = await supabase
        .from('student_programs')
        .select('student_id, program_name')
        .in('student_id', studentIds);
      if (error) throw error;
      const map = new Map<string, string[]>();
      (data || []).forEach((row: any) => {
        const existing = map.get(row.student_id) || [];
        existing.push(row.program_name);
        map.set(row.student_id, existing);
      });
      return map;
    },
    enabled: studentIds.length > 0,
    staleTime: 30000,
  });
}
