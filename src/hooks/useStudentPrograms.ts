import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
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

  const normalizeJoinDate = useCallback((joinDate?: string) => {
    if (!joinDate) return new Date().toISOString().slice(0, 10);
    const trimmed = joinDate.trim();
    if (!trimmed) return new Date().toISOString().slice(0, 10);
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return new Date().toISOString().slice(0, 10);
    }
    return parsed.toISOString().slice(0, 10);
  }, []);

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

  const syncStudentProgramField = useCallback(async (studentId: string) => {
    const { data: allProgs, error: allProgsError } = await supabase
      .from('student_programs')
      .select('program_name')
      .eq('student_id', studentId)
      .order('is_primary', { ascending: false });
    if (allProgsError) throw allProgsError;

    if (allProgs && allProgs.length > 0) {
      const programStr = allProgs.map((p) => p.program_name).join(', ');
      const { error: studentUpdateError } = await supabase
        .from('students')
        .update({ program: programStr })
        .eq('id', studentId);
      if (studentUpdateError) throw studentUpdateError;
      return;
    }

    const { error: clearProgramError } = await supabase
      .from('students')
      .update({ program: '' })
      .eq('id', studentId);
    if (clearProgramError) throw clearProgramError;
  }, []);

  const addProgram = useCallback(
    async (studentId: string, programName: string, joinDate?: string) => {
      const cleanProgramName = (programName || '').trim();
      if (!cleanProgramName) {
        toast.error('Select a valid program to add');
        return false;
      }

      const { data, error } = await supabase
        .from('student_programs')
        .insert({
          student_id: studentId,
          program_name: cleanProgramName,
          joined_at: normalizeJoinDate(joinDate),
          is_primary: false,
        })
        .select();
      if (error) {
        console.error('addProgram insert error:', error);
        if (error.code === '23505') {
          toast.error(`Student is already enrolled in ${cleanProgramName}`);
        } else {
          toast.error('Failed to add program: ' + error.message);
        }
        return false;
      }
      console.log('addProgram insert success:', data);
      try {
        await syncStudentProgramField(studentId);
      } catch (syncError: any) {
        toast.error('Program was added, but student profile sync failed.');
        console.error('syncStudentProgramField failed after addProgram', syncError);
      }
      queryClient.invalidateQueries({ queryKey: ['student-programs', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['student-programs-all'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success(`Added ${cleanProgramName} program`);
      return true;
    },
    [normalizeJoinDate, queryClient, syncStudentProgramField]
  );

  const removeProgram = useCallback(
    async (programId: string, studentId?: string) => {
      const { error } = await supabase
        .from('student_programs')
        .delete()
        .eq('id', programId);
      if (error) {
        toast.error('Failed to remove program: ' + error.message);
        return false;
      }
      if (studentId) {
        try {
          await syncStudentProgramField(studentId);
        } catch (syncError: any) {
          toast.error('Program removed, but student profile sync failed.');
          console.error(
            'syncStudentProgramField failed after removeProgram',
            syncError
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ['student-programs', studentId] });
      queryClient.invalidateQueries({ queryKey: ['student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['all-student-programs'] });
      queryClient.invalidateQueries({ queryKey: ['student-programs-all'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Program removed');
      return true;
    },
    [queryClient, syncStudentProgramField]
  );

  return { programs, isLoading, addProgram, removeProgram };
}

// Bulk fetch all student programs for list views
export function useAllStudentPrograms(studentIds: string[]) {
  return useQuery({
    queryKey: ['all-student-programs', [...studentIds].sort().join(',')],
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
