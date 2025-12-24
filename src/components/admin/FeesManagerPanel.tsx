import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
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
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Grid, List, DollarSign, CheckSquare, X } from 'lucide-react';

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
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  useEffect(() => {
    const channel = supabase
      .channel('public:fees:fees-manager')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, () =>
        queryClient.invalidateQueries({ queryKey: ['fees'] })
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
      const { data, error } = await supabase.from('fees').select('*').eq('month', filterMonth).eq('year', filterYear);
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

  // Bulk mark as paid mutation
  const bulkMarkPaidMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      const updates = studentIds.map(async (studentId) => {
        const student = students?.find((s) => s.id === studentId);
        const existingFee = fees?.find((f) => f.student_id === studentId);
        const monthlyFee = existingFee?.monthly_fee || student?.default_monthly_fee || 2000;

        if (existingFee) {
          // Update existing fee
          const { error } = await supabase
            .from('fees')
            .update({ status: 'paid', paid_amount: monthlyFee, balance_due: 0 })
            .eq('id', existingFee.id);
          if (error) throw error;
        } else {
          // Create new fee record
          const { error } = await supabase.from('fees').insert({
            student_id: studentId,
            month: filterMonth,
            year: filterYear,
            monthly_fee: monthlyFee,
            paid_amount: monthlyFee,
            balance_due: 0,
            status: 'paid',
          });
          if (error) throw error;
        }
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      setSelectedStudentIds(new Set());
      setBulkMode(false);
      toast({ title: 'Success', description: 'Selected students marked as paid' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'error' });
    },
  });

  // Compose filtered rows
  const rows = Array.isArray(students)
    ? students
        .map((student) => {
          const fee = fees?.find((f) => f.student_id === student.id) || null;
          return { student, fee };
        })
        .filter((row) => {
          if (filterName && !row.student.name.toLowerCase().includes(filterName.toLowerCase())) return false;
          if (filterStatus) {
            const status = row.fee ? (row.fee.status || 'unpaid').toLowerCase() : 'unpaid';
            return status === filterStatus.toLowerCase();
          }
          return true;
        })
    : [];

  const isLoading = loadingStudents || loadingFees || isRefreshing;

  // Selection handlers
  const toggleSelection = (studentId: string) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const selectAllUnpaid = () => {
    const unpaidIds = rows.filter((r) => !r.fee || r.fee.status !== 'paid').map((r) => r.student.id);
    setSelectedStudentIds(new Set(unpaidIds));
  };

  const clearSelection = () => {
    setSelectedStudentIds(new Set());
    setBulkMode(false);
  };

  const handleBulkMarkPaid = () => {
    if (selectedStudentIds.size === 0) return;
    bulkMarkPaidMutation.mutate(Array.from(selectedStudentIds));
  };

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
      toast({ title: 'Success', description: 'Fees refreshed successfully' });
    } catch (error: any) {
      toast({ title: 'Error', description: 'Failed to refresh fees', variant: 'error' });
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

    if (viewMode === 'table') {
      return (
        <div className="rounded-2xl shadow-lg overflow-x-auto bg-card animate-fade-in">
          <FeesTable rows={rows} isLoading={false} onEditFee={handleEditFee} onShowHistory={handleShowHistory} />
        </div>
      );
    }
    return (
      <FeesCards
        rows={rows}
        onEditFee={handleEditFee}
        onShowHistory={handleShowHistory}
        bulkMode={bulkMode}
        selectedIds={selectedStudentIds}
        onToggleSelect={toggleSelection}
        filterMonth={filterMonth}
        filterYear={filterYear}
      />
    );
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-card border border-border/50 shadow-sm rounded-xl sm:rounded-2xl">
        <div className="border-b border-border/50 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Fees Management</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Manage student fees, track payments, and monitor financial records.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <RefreshButton onRefresh={handleRefresh} isLoading={isLoading} className="flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
              {/* Bulk Mode Toggle */}
              <Button
                variant={bulkMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setBulkMode(!bulkMode);
                  if (bulkMode) clearSelection();
                }}
                className="h-9"
              >
                <CheckSquare className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Bulk Select</span>
              </Button>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-full p-1 bg-muted/50">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="rounded-full px-3 h-7"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="rounded-full px-3 h-7"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button
                onClick={() => exportFeesToCsv(rows, filterMonth, filterYear)}
                disabled={!Array.isArray(rows) || rows.length === 0}
                variant="outline"
                size="sm"
                className="h-9"
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {bulkMode && (
            <Card className="p-3 sm:p-4 bg-primary/5 border-primary/20">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {selectedStudentIds.size} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={selectAllUnpaid} className="h-8 text-xs">
                    Select All Unpaid
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection} className="h-8 text-xs">
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <Button
                  onClick={handleBulkMarkPaid}
                  disabled={selectedStudentIds.size === 0 || bulkMarkPaidMutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-9"
                >
                  {bulkMarkPaidMutation.isPending ? 'Processing...' : `Mark ${selectedStudentIds.size} as Paid`}
                </Button>
              </div>
            </Card>
          )}

          {/* Content */}
          <div className="w-full space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="animate-spin h-8 w-8 sm:h-10 sm:w-10 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm sm:text-base text-muted-foreground mt-4">Loading fees data...</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">No fee records found</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Try adjusting your filters or add students to begin tracking fees.
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
