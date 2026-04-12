import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import FeeSummaryCard from './FeeSummaryCard';
import FeesTable from './FeesTable';
import FeeEditModal from './FeeEditModal';
import FeeHistoryDrawer from './FeeHistoryDrawer';
import FeesFilterBar from './FeesFilterBar';
import { exportFeesToCsv } from '@/utils/exportToCsv';
const FeeAnalyticsChart = lazy(() => import('./FeeAnalyticsChart'));
import { useIsMobile } from '@/hooks/useMobile';
import FeesCards from './FeesCards';
import RefreshButton from './RefreshButton';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useProgramFees } from './FeeSettingsCard';
import { usePersistentState } from '@/hooks/usePersistentState';
import {
  STUDENTS_QUERY_KEY,
  STUDENTS_SHARED_SELECT,
} from '@/constants/studentsQuery';
import {
  Grid,
  List,
  DollarSign,
  CheckSquare,
  X,
  Zap,
  Loader2,
} from 'lucide-react';
import { FeeCardsGridSkeleton, FeeTableSkeleton } from './AdminSkeletons';
import { mapSupabaseErrorToFriendly } from '@/utils/errorHandling';

type FeesManagerPanelSection = 'all' | 'records' | 'stats';

type FeesManagerPanelProps = {
  section?: FeesManagerPanelSection;
  enableAnalytics?: boolean;
};

export default function FeesManagerPanel({
  section = 'all',
  enableAnalytics = true,
}: FeesManagerPanelProps) {
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
  const [viewMode, setViewMode] = usePersistentState<'cards' | 'table'>(
    'admin:layout:view-mode',
    'cards',
    ['cards', 'table']
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkMode, setBulkMode] = useState(false);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { data: programFees } = useProgramFees();

  const getFriendlySupabaseMessage = (error: unknown, fallback: string) => {
    const friendly = mapSupabaseErrorToFriendly(error);
    if (friendly?.message) return friendly.message;
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

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
    queryKey: STUDENTS_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select(STUDENTS_SHARED_SELECT);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: enrollmentEmails = [] } = useQuery({
    queryKey: ['enrollment-request-emails'],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('enrollment_requests' as any)
        .select('linked_student_id, student_email, parent_email, created_at')
        .not('linked_student_id', 'is', null)
        .order('created_at', { ascending: false })) as any;

      if (error) throw error;
      return (data || []) as Array<{
        linked_student_id: string;
        student_email: string | null;
        parent_email: string | null;
        created_at: string;
      }>;
    },
    staleTime: 60_000,
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

  // Bulk mark as paid mutation
  const bulkMarkPaidMutation = useMutation({
    mutationFn: async (studentIds: string[]) => {
      const updates = studentIds.map(async (studentId) => {
        const student = students?.find((s) => s.id === studentId);
        const existingFee = fees?.find((f) => f.student_id === studentId);
        const monthlyFee =
          existingFee?.monthly_fee || student?.default_monthly_fee || 2000;

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
      toast({
        title: 'Success',
        description: 'Selected students marked as paid',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: getFriendlySupabaseMessage(
          error,
          'Failed to mark selected students as paid'
        ),
        variant: 'error',
      });
    },
  });

  // Batch fee generation mutation
  const batchGenerateMutation = useMutation({
    mutationFn: async () => {
      if (!students || students.length === 0)
        throw new Error('No students found');

      const existingStudentIds = new Set((fees || []).map((f) => f.student_id));
      const studentsWithoutFee = students.filter(
        (s) => !existingStudentIds.has(s.id)
      );

      if (studentsWithoutFee.length === 0)
        throw new Error('All students already have fee records for this month');

      const records = studentsWithoutFee.map((s) => {
        // Use program-specific fee if available, otherwise student default
        const programFee =
          programFees?.[s.program] ?? s.default_monthly_fee ?? 2000;
        const baseFee = s.default_monthly_fee ?? programFee;
        const discountedFee =
          s.discount_percent > 0
            ? Math.round(baseFee * (1 - s.discount_percent / 100))
            : baseFee;
        return {
          student_id: s.id,
          month: filterMonth,
          year: filterYear,
          monthly_fee: discountedFee,
          paid_amount: 0,
          balance_due: discountedFee,
          status: 'unpaid',
        };
      });

      const { error } = await supabase.from('fees').insert(records);
      if (error) throw error;
      return studentsWithoutFee.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast({
        title: 'Batch Generated',
        description: `Created fee records for ${count} students`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: getFriendlySupabaseMessage(
          error,
          'Failed to generate fee records'
        ),
        variant: 'error',
      });
    },
  });

  // Compose filtered rows
  const emailByStudentId = new Map<string, string>();
  for (const row of enrollmentEmails) {
    const studentId = (row.linked_student_id || '').toString();
    const email = ((row.student_email || row.parent_email || '') as string)
      .toString()
      .trim();
    if (!studentId || !email || emailByStudentId.has(studentId)) continue;
    emailByStudentId.set(studentId, email);
  }

  const rows = Array.isArray(students)
    ? students
        .map((student) => {
          const fee = fees?.find((f) => f.student_id === student.id) || null;
          const reminderEmail = emailByStudentId.get(student.id) || null;
          return { student, fee, reminderEmail };
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
  const hasActiveFilters = Boolean(filterName.trim() || filterStatus);
  const shouldShowGenerateCta = (fees?.length ?? 0) === 0 && !hasActiveFilters;

  const feeSnapshot = useMemo(() => {
    const paid = rows.filter((r) => r.fee?.status === 'paid').length;
    const unpaid = rows.filter((r) => !r.fee || r.fee.status !== 'paid').length;
    const totalDue = rows.reduce((sum, r) => {
      if (r.fee) {
        return sum + Number(r.fee.balance_due || 0);
      }
      return sum + Number(r.student.default_monthly_fee || 0);
    }, 0);

    return {
      paid,
      unpaid,
      totalDue,
      total: rows.length,
    };
  }, [rows]);

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
    const unpaidIds = rows
      .filter((r) => !r.fee || r.fee.status !== 'paid')
      .map((r) => r.student.id);
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
      await queryClient.invalidateQueries({ queryKey: STUDENTS_QUERY_KEY });
      await queryClient.refetchQueries({ queryKey: ['fees'] });
      await queryClient.refetchQueries({ queryKey: STUDENTS_QUERY_KEY });
      toast({ title: 'Success', description: 'Fees refreshed successfully' });
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
      return viewMode === 'table' ? (
        <FeeTableSkeleton />
      ) : (
        <FeeCardsGridSkeleton />
      );
    }

    if (viewMode === 'table') {
      return (
        <div className="rounded-xl shadow-sm overflow-x-auto bg-card animate-fade-in border border-border/50">
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
        bulkMode={bulkMode}
        selectedIds={selectedStudentIds}
        onToggleSelect={toggleSelection}
        filterMonth={filterMonth}
        filterYear={filterYear}
      />
    );
  };

  const showStatsSections = section === 'all' || section === 'stats';
  const showRecordsSection = section === 'all' || section === 'records';

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-panel rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="admin-panel-header bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-foreground">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Fees Management</span>
              </h2>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                Manage student fees, track payments, and monitor financial
                records.
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
      </div>

      {showStatsSections && (
        <>
          {/* Stats Card */}
          <div className="admin-panel rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="admin-panel-body space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground sm:text-base">
                  Snapshot
                </h3>
                <p className="text-xs text-muted-foreground">
                  Month {filterMonth}/{filterYear}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Students</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                    {feeSnapshot.total}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Paid</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                    {feeSnapshot.paid}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Pending</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                    {feeSnapshot.unpaid}
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Total Due</p>
                  <p className="text-base sm:text-lg font-semibold text-foreground tabular-nums">
                    ₹{feeSnapshot.totalDue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights Card */}
          <div className="admin-panel rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="admin-panel-body space-y-4 sm:space-y-6">
              {enableAnalytics ? (
                <Suspense
                  fallback={
                    <div className="h-[320px] flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  }
                >
                  <FeeAnalyticsChart />
                </Suspense>
              ) : (
                <div className="h-[320px] rounded-xl border border-border/60 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                  Open the Stats tab to load analytics.
                </div>
              )}

              <FeeSummaryCard fees={fees || []} loading={loadingFees} />
            </div>
          </div>
        </>
      )}
      {showRecordsSection && (
        <div className="admin-panel rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="admin-panel-body space-y-4 sm:space-y-6">
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
            <div className="flex flex-wrap gap-2 sm:gap-3 rounded-xl border border-border/70 bg-muted/20 p-2">
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
              <div className="admin-toggle border-border/70 bg-card">
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

              <Button
                onClick={() => batchGenerateMutation.mutate()}
                disabled={batchGenerateMutation.isPending}
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
              >
                {batchGenerateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Generate All</span>
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllUnpaid}
                    className="h-8 text-xs"
                  >
                    Select All Unpaid
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="h-8 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
                <Button
                  onClick={handleBulkMarkPaid}
                  disabled={
                    selectedStudentIds.size === 0 ||
                    bulkMarkPaidMutation.isPending
                  }
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 h-9"
                >
                  {bulkMarkPaidMutation.isPending
                    ? 'Processing...'
                    : `Mark ${selectedStudentIds.size} as Paid`}
                </Button>
              </div>
            </Card>
          )}

          {/* Content */}
          <div className="w-full space-y-4">
            {isLoading ? (
              viewMode === 'table' ? (
                <FeeTableSkeleton />
              ) : (
                <FeeCardsGridSkeleton />
              )
            ) : rows.length === 0 ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                  No fee records found
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {hasActiveFilters
                    ? 'Try adjusting or clearing your filters to see matching fee records.'
                    : 'No fee records exist for this month yet. Generate fee records to get started.'}
                </p>
                {shouldShowGenerateCta ? (
                  <Button
                    onClick={() => batchGenerateMutation.mutate()}
                    disabled={batchGenerateMutation.isPending}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    Generate Fee Records
                  </Button>
                ) : hasActiveFilters ? (
                  <Button
                    onClick={() => {
                      setFilterName('');
                      setFilterStatus('');
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            ) : (
              renderContent()
            )}
          </div>
          </div>
        </div>
      )}

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
