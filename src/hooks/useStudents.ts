import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { STUDENTS_QUERY_KEY, STUDENTS_SHARED_SELECT } from '@/constants/studentsQuery';

type StudentRow = {
  id: string;
  name: string;
  aadhar_number: string;
  program: string;
  join_date: string;
  parent_name: string;
  parent_contact: string;
  parent_email: string | null;
  profile_image_url: string | null;
  created_at: string | null;
  default_monthly_fee: number;
  discount_percent: number;
};

export function useStudents() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<'name' | 'program' | 'join_date'>(
    'join_date'
  );
  const [sortAsc, setSortAsc] = useState(false);

  const fetchStudents = useCallback(async (): Promise<StudentRow[]> => {
    const { data, error } = await supabase
      .from('students')
      .select(STUDENTS_SHARED_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    return (data || []) as StudentRow[];
  }, []);

  const {
    data: students = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: fetchStudents,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    const channel = supabase
      .channel('gsai-students-admin-realtime-hook')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Get unique programs for filter dropdown
  const programOptions = useMemo(() => {
    const programs = [...new Set(students.map((s) => s.program))]
      .filter(Boolean)
      .sort();
    return programs;
  }, [students]);

  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Filter by search term
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.parent_name?.toLowerCase().includes(q)
      );
    }

    // Filter by program
    if (programFilter && programFilter !== 'all') {
      filtered = filtered.filter((s) => s.program === programFilter);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortCol === 'join_date') {
        return sortAsc
          ? new Date(a.join_date).getTime() - new Date(b.join_date).getTime()
          : new Date(b.join_date).getTime() - new Date(a.join_date).getTime();
      }
      const aV = (a[sortCol] ?? '').toLowerCase();
      const bV = (b[sortCol] ?? '').toLowerCase();
      if (aV < bV) return sortAsc ? -1 : 1;
      if (aV > bV) return sortAsc ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [students, search, programFilter, sortCol, sortAsc]);

  const requestSort = (key: 'name' | 'program' | 'join_date') => {
    const isAsc = sortCol === key ? !sortAsc : true;
    setSortCol(key);
    setSortAsc(isAsc);
  };

  const sortConfig = {
    key: sortCol,
    direction: (sortAsc ? 'asc' : 'desc') as 'asc' | 'desc',
  };

  return {
    students,
    loading: loading && students.length === 0,
    filteredStudents,
    search,
    setSearch,
    programFilter,
    setProgramFilter,
    programOptions,
    sortConfig,
    requestSort,
    refetchStudents: async () => {
      try {
        await refetch();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        toast.error('Failed to refresh students: ' + message);
      }
    },
    isBackgroundRefreshing: isFetching && students.length > 0,
  };
}
