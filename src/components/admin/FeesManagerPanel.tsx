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
import { Grid, List, DollarSign } from 'lucide-react';

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
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-none sm:rounded-2xl">
        <div className="border-b border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Fees Management</span>
              </h2>

              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Manage student fees, track payments, and monitor financial
                records across all programs.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton
                onRefresh={handleRefresh}
                isLoading={isLoading}
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Summary Card */}
          <FeeSummaryCard fees={fees || []} loading={loadingFees} />

          {/* Filters and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
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

            {/* View Controls */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-full p-1 bg-muted/50 flex-1 sm:flex-initial">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-full px-3 flex-1 sm:flex-initial"
                >
                  <Grid className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Cards</span>
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-full px-3 flex-1 sm:flex-initial"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Table</span>
                </Button>
              </div>

              <Button
                onClick={() => exportFeesToCsv(rows, filterMonth, filterYear)}
                disabled={!Array.isArray(rows) || rows.length === 0}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-initial min-w-[100px]"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="w-full space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">
                  Loading fees data...
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No fee records found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Try adjusting your filters or add students to begin tracking
                  fees.
                </p>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>

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
