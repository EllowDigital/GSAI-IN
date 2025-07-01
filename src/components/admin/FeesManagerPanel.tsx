import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import FeeSummaryCard from './FeeSummaryCard';
import FeesTable from './FeesTable';
import FeeEditModal from './FeeEditModal';
import FeeHistoryDrawer from './FeeHistoryDrawer';
import FeesFilterBar from './FeesFilterBar';
import { exportFeesToCsv } from '@/utils/exportToCsv';
import { useIsMobile } from '@/hooks/use-mobile';
import FeesCards from './FeesCards';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Grid, List } from 'lucide-react';

export default function FeesManagerPanel() {
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterStatus, setFilterStatus] = useState('');
  const [filterName, setFilterName] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<any | null>(null);
  const [editFee, setEditFee] = useState<any | null>(null);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historyStudent, setHistoryStudent] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  useEffect(() => {
    const channel = supabase
      .channel('public:fees:fees-manager')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fees' },
        () => queryClient.invalidateQueries({ queryKey: ['fees'] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Fetch students
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, program, default_monthly_fee, profile_image_url');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch fees for filtered month/year
  const { data: fees, isLoading: loadingFees } = useQuery({
    queryKey: ['fees', filterMonth, filterYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('month', filterMonth)
        .eq('year', filterYear);
      if (error) throw error;
      return data || [];
    },
  });

  // All fees for history drawer
  const { data: allFees } = useQuery({
    queryKey: ['fees', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled: historyDrawerOpen,
  });

  // Compose filtered rows
  const rows = Array.isArray(students)
    ? students
        .map((student) => {
          const fee = fees?.find((f) => f.student_id === student.id) || null;
          return { student, fee };
        })
        .filter((row) => {
          if (
            filterName &&
            !row.student.name.toLowerCase().includes(filterName.toLowerCase())
          )
            return false;
          if (filterStatus) {
            const status = row.fee
              ? (row.fee.status || 'unpaid').toLowerCase()
              : 'unpaid';
            return status === filterStatus.toLowerCase();
          }
          return true;
        })
    : [];

  const isLoading = loadingStudents || loadingFees || isRefreshing;

  // Handlers
  const handleEditFee = ({ student, fee }: { student: any; fee?: any }) => {
    setEditStudent(student);
    setEditFee(fee);
    setModalOpen(true);
  };

  const handleShowHistory = (student: any) => {
    setHistoryStudent(student);
    setHistoryDrawerOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Auto-refresh after modal close
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
    }, 100);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['fees'] });
      await queryClient.invalidateQueries({ queryKey: ['students'] });
      await queryClient.refetchQueries({ queryKey: ['fees'] });
      await queryClient.refetchQueries({ queryKey: ['students'] });
      toast({
        title: 'Success',
        description: 'Fees refreshed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to refresh fees',
        variant: 'error',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full py-10 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-400 rounded-full border-t-transparent" />
        </div>
      );
    }

    // Use view mode state instead of window width check
    if (viewMode === 'table') {
      return (
        <div className="rounded-2xl shadow-lg overflow-x-auto bg-white animate-fade-in">
          <FeesTable
            rows={rows}
            isLoading={false}
            onEditFee={handleEditFee}
            onShowHistory={handleShowHistory}
          />
        </div>
      );
    }
    return (
      <FeesCards
        rows={rows}
        onEditFee={handleEditFee}
        onShowHistory={handleShowHistory}
      />
    );
  };

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6">
      {/* Summary and Controls */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 lg:mb-6">
        <FeeSummaryCard fees={fees || []} loading={loadingFees} />
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 lg:gap-4 animate-fade-in">
          <div className="flex-1">
            <FeesFilterBar
              filterMonth={filterMonth}
              filterYear={filterYear}
              filterStatus={filterStatus}
              filterName={filterName}
              setFilterMonth={setFilterMonth}
              setFilterYear={setFilterYear}
              setFilterStatus={setFilterStatus}
              setFilterName={setFilterName}
            />
          </div>
          <div className="flex gap-3 w-full xl:w-auto">
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
              className="flex-1 xl:flex-none min-w-[100px]"
            />

            {/* View Mode Toggle */}
            <div className="flex gap-1 border rounded-full p-1 bg-gray-50 flex-1 xl:flex-none">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-full px-3 flex-1 xl:flex-none"
              >
                <Grid size={16} />
                <span className="hidden sm:inline ml-1">Cards</span>
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-full px-3 flex-1 xl:flex-none"
              >
                <List size={16} />
                <span className="hidden sm:inline ml-1">Table</span>
              </Button>
            </div>

            <button
              onClick={() => exportFeesToCsv(rows, filterMonth, filterYear)}
              className="border border-yellow-400 px-3 md:px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-200 transition text-sm flex-1 xl:flex-none xl:min-w-[120px]"
              disabled={!Array.isArray(rows) || rows.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full overflow-hidden">{renderContent()}</div>

      {/* Modals/Drawers */}
      {modalOpen && (
        <FeeEditModal
          open={modalOpen}
          onClose={handleModalClose}
          student={editStudent}
          fee={editFee}
          month={filterMonth}
          year={filterYear}
        />
      )}
      {historyDrawerOpen && (
        <FeeHistoryDrawer
          open={historyDrawerOpen}
          onClose={() => setHistoryDrawerOpen(false)}
          student={historyStudent}
          allFees={allFees}
        />
      )}
    </div>
  );
}
