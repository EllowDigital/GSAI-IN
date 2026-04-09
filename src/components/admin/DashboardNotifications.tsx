import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import {
  Bell,
  CreditCard,
  Award,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// --- Types ---
interface Notification {
  id: string;
  type: 'unpaid_fee' | 'belt_test';
  title: string;
  description: string;
  link: string;
  severity: 'warning' | 'info';
  count?: number;
}

interface StudentDB {
  name: string;
}

interface BeltLevelDB {
  color: string;
  rank: number;
}

interface UnpaidFeeDB {
  id: string;
  student_id: string;
  month: number;
  year: number;
  monthly_fee: number | null;
  paid_amount: number | null;
  students: StudentDB; 
}

interface StudentProgressDB {
  id: string;
  student_id: string;
  status: string;
  stripe_count: number;
  students: StudentDB;
  belt_levels: BeltLevelDB;
}

export default function DashboardNotifications() {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const notifs: Notification[] = [];

      // 1. Fetch unpaid fees with student names
      const { data: unpaidFees, error: feesError } = await supabase
        .from('fees')
        .select(`
          id, 
          student_id,
          month,
          year,
          monthly_fee,
          paid_amount,
          students!inner(name)
        `)
        .or('status.eq.unpaid,status.eq.partial')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
        .limit(50);

      if (feesError) console.error('Error fetching unpaid fees:', feesError);

      if (unpaidFees && unpaidFees.length > 0) {
        const typedUnpaidFees = unpaidFees as unknown as UnpaidFeeDB[];
        
        // Group by student
        const studentUnpaid = typedUnpaidFees.reduce((acc, fee) => {
          const studentName = fee.students?.name || 'Unknown Student';
          if (!acc[fee.student_id]) {
            acc[fee.student_id] = { name: studentName, count: 0, total: 0 };
          }
          acc[fee.student_id].count += 1;
          acc[fee.student_id].total += (fee.monthly_fee || 0) - (fee.paid_amount || 0);
          return acc;
        }, {} as Record<string, { name: string; count: number; total: number }>);

        const studentsWithUnpaid = Object.entries(studentUnpaid);

        if (studentsWithUnpaid.length > 3) {
          notifs.push({
            id: 'unpaid-fees-summary',
            type: 'unpaid_fee',
            title: `${studentsWithUnpaid.length} students have unpaid fees`,
            description: `Total outstanding: ₹${studentsWithUnpaid.reduce((sum, [, s]) => sum + s.total, 0).toLocaleString('en-IN')}`,
            link: '/admin/dashboard/fees',
            severity: 'warning',
            count: studentsWithUnpaid.length,
          });
        } else {
          studentsWithUnpaid.forEach(([studentId, data]) => {
            notifs.push({
              id: `unpaid-${studentId}`,
              type: 'unpaid_fee',
              title: `${data.name} has ${data.count} unpaid fee${data.count > 1 ? 's' : ''}`,
              description: `Outstanding: ₹${data.total.toLocaleString('en-IN')}`,
              link: '/admin/dashboard/fees',
              severity: 'warning',
            });
          });
        }
      }

      // 2. Fetch students ready for belt tests
      const { data: readyForTest, error: testError } = await supabase
        .from('student_progress')
        .select(`
          id,
          student_id,
          status,
          stripe_count,
          students!inner(name),
          belt_levels!inner(color, rank)
        `)
        .eq('status', 'ready')
        .limit(20);

      if (testError) console.error('Error fetching belt tests:', testError);

      if (readyForTest && readyForTest.length > 0) {
        const typedTests = readyForTest as unknown as StudentProgressDB[];

        if (typedTests.length > 3) {
          notifs.push({
            id: 'belt-test-summary',
            type: 'belt_test',
            title: `${typedTests.length} students ready for belt tests`,
            description: 'Schedule assessments for students who have completed requirements',
            link: '/admin/dashboard/progression',
            severity: 'info',
            count: typedTests.length,
          });
        } else {
          typedTests.forEach((progress) => {
            const studentName = progress.students?.name || 'Unknown Student';
            const beltColor = progress.belt_levels?.color || 'Unknown Belt';
            notifs.push({
              id: `belt-${progress.id}`,
              type: 'belt_test',
              title: `${studentName} is ready for belt test`,
              description: `Current belt: ${beltColor} - Ready for promotion assessment`,
              link: '/admin/dashboard/progression',
              severity: 'info',
            });
          });
        }
      }

      // 3. Check for students with 4 stripes (max before promotion)
      const { data: maxStripes, error: stripesError } = await supabase
        .from('student_progress')
        .select(`
          id,
          student_id,
          stripe_count,
          students!inner(name),
          belt_levels!inner(color)
        `)
        .gte('stripe_count', 4)
        .neq('status', 'completed')
        .limit(10);

      if (stripesError) console.error('Error fetching stripes:', stripesError);

      if (maxStripes && maxStripes.length > 0) {
        const typedStripes = maxStripes as unknown as StudentProgressDB[];
        typedStripes.forEach((progress) => {
          const studentName = progress.students?.name || 'Unknown Student';
          const beltColor = progress.belt_levels?.color || 'Unknown Belt';
          notifs.push({
            id: `stripes-${progress.id}`,
            type: 'belt_test',
            title: `${studentName} has ${progress.stripe_count} stripes`,
            description: `${beltColor} belt - Consider scheduling promotion test`,
            link: '/admin/dashboard/progression',
            severity: 'info',
          });
        });
      }

      return notifs;
    },
    refetchInterval: 60000, 
  });

  const visibleNotifications = notifications.filter((n) => !dismissedIds.has(n.id));

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const handleDismissAll = () => {
    setDismissedIds(new Set(notifications.map((n) => n.id)));
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <div className="grid gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-4 flex gap-4 items-start">
                <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- Empty State ---
  if (visibleNotifications.length === 0) {
    return (
      <div className="space-y-3 animate-in fade-in duration-500">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Action Center
        </h2>
        <Card className="border-dashed border-border/60 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="p-3 rounded-full bg-emerald-500/10">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Inbox Zero</p>
              <p className="text-xs text-muted-foreground mt-1">You are all caught up on notifications!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <div className="relative">
            <Bell className="w-5 h-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background" />
          </div>
          Action Center
          <Badge variant="secondary" className="ml-1 text-[11px] px-2 font-bold">
            {visibleNotifications.length}
          </Badge>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground h-8 px-3 rounded-lg"
          onClick={handleDismissAll}
        >
          Dismiss All
        </Button>
      </div>

      <div className="grid gap-3">
        {visibleNotifications.slice(0, 5).map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md rounded-2xl border",
              notification.severity === 'warning'
                ? 'border-amber-200/50 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/10 hover:border-amber-300/50'
                : 'border-blue-200/50 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/10 hover:border-blue-300/50'
            )}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3 sm:gap-4">
                
                {/* Icon */}
                <div
                  className={cn(
                    "shrink-0 p-2.5 rounded-xl shadow-sm",
                    notification.severity === 'warning'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                  )}
                >
                  {notification.type === 'unpaid_fee' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Award className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                    {notification.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-1 font-medium">
                    {notification.description}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <Link to={notification.link}>
                        View Details
                        <ChevronRight className="w-3.5 h-3.5 ml-1 -mr-1 opacity-60" />
                      </Link>
                    </Button>
                    
                    {notification.count && notification.count > 1 && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          notification.severity === 'warning'
                            ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                            : 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                        )}
                      >
                        {notification.count} {notification.type === 'unpaid_fee' ? 'Students' : 'Ready'}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Absolute Dismiss Button (Mobile friendly) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-3 h-8 w-8 rounded-full text-muted-foreground/50 opacity-100 transition-all hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                  onClick={() => handleDismiss(notification.id)}
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {visibleNotifications.length > 5 && (
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-border/50 flex-1" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              +{visibleNotifications.length - 5} More
            </p>
            <div className="h-px bg-border/50 flex-1" />
          </div>
        )}
      </div>
    </div>
  );
}