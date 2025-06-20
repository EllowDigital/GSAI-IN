
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

type StudentRow = {
  id: string;
  name: string;
  aadhar_number: string;
  program: string;
  join_date: string;
  parent_name: string;
  parent_contact: string;
  profile_image_url: string | null;
  created_at: string | null;
};

export function useStudents() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<'name' | 'program' | 'join_date'>(
    'join_date'
  );
  const [sortAsc, setSortAsc] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('students')
      .select(
        'id, name, aadhar_number, program, join_date, parent_name, parent_contact, profile_image_url, created_at'
      )
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to fetch students: ' + error.message);
    }
    setStudents((data || []) as StudentRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;
    const runFetch = async () => {
      if (!ignore) {
        await fetchStudents();
      }
    };
    runFetch();

    const channel = supabase
      .channel('gsai-students-admin-realtime-hook')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        fetchStudents
      )
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, [fetchStudents]);

  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.program.toLowerCase().includes(q)
      );
    }
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
  }, [students, search, sortCol, sortAsc]);

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
    loading,
    filteredStudents,
    search,
    setSearch,
    sortConfig,
    requestSort,
    refetchStudents: fetchStudents,
  };
}
