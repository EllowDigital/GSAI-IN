import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  Bell, 
  CreditCard, 
  Award, 
  ChevronRight,
  X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'unpaid_fee' | 'belt_test';
  title: string;
  description: string;
  link: string;
  severity: 'warning' | 'info';
  count?: number;
}

export default function DashboardNotifications() {
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const notifs: Notification[] = [];

      // Fetch unpaid fees with student names
      const { data: unpaidFees } = await supabase
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

      if (unpaidFees && unpaidFees.length > 0) {
        // Group by student
        const studentUnpaid = unpaidFees.reduce((acc, fee) => {
          const studentName = (fee.students as any)?.name || 'Unknown';
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
            description: `Total outstanding: ₹${studentsWithUnpaid.reduce((sum, [, s]) => sum + s.total, 0).toLocaleString()}`,
            link: '/admin/dashboard/fees',
            severity: 'warning',
            count: studentsWithUnpaid.length
          });
        } else {
          studentsWithUnpaid.forEach(([studentId, data]) => {
            notifs.push({
              id: `unpaid-${studentId}`,
              type: 'unpaid_fee',
              title: `${data.name} has ${data.count} unpaid fee${data.count > 1 ? 's' : ''}`,
              description: `Outstanding: ₹${data.total.toLocaleString()}`,
              link: '/admin/dashboard/fees',
              severity: 'warning'
            });
          });
        }
      }

      // Fetch students ready for belt tests (status = 'ready')
      const { data: readyForTest } = await supabase
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

      if (readyForTest && readyForTest.length > 0) {
        if (readyForTest.length > 3) {
          notifs.push({
            id: 'belt-test-summary',
            type: 'belt_test',
            title: `${readyForTest.length} students ready for belt tests`,
            description: 'Schedule assessments for students who have completed requirements',
            link: '/admin/dashboard/progression',
            severity: 'info',
            count: readyForTest.length
          });
        } else {
          readyForTest.forEach((progress) => {
            const studentName = (progress.students as any)?.name || 'Unknown';
            const beltColor = (progress.belt_levels as any)?.color || 'Unknown';
            notifs.push({
              id: `belt-${progress.id}`,
              type: 'belt_test',
              title: `${studentName} is ready for belt test`,
              description: `Current belt: ${beltColor} - Ready for promotion assessment`,
              link: '/admin/dashboard/progression',
              severity: 'info'
            });
          });
        }
      }

      // Check for students with 4 stripes (max before promotion)
      const { data: maxStripes } = await supabase
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

      if (maxStripes && maxStripes.length > 0) {
        maxStripes.forEach((progress) => {
          const studentName = (progress.students as any)?.name || 'Unknown';
          const beltColor = (progress.belt_levels as any)?.color || 'Unknown';
          notifs.push({
            id: `stripes-${progress.id}`,
            type: 'belt_test',
            title: `${studentName} has ${progress.stripe_count} stripes`,
            description: `${beltColor} belt - Consider scheduling promotion test`,
            link: '/admin/dashboard/progression',
            severity: 'info'
          });
        });
      }

      return notifs;
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  if (isLoading || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Notifications
          <Badge variant="secondary" className="ml-1 text-xs">
            {visibleNotifications.length}
          </Badge>
        </h2>
        {visibleNotifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setDismissedIds(new Set(notifications.map(n => n.id)))}
          >
            Dismiss all
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:gap-3">
        {visibleNotifications.slice(0, 5).map((notification) => (
          <Card
            key={notification.id}
            className={`group relative overflow-hidden border transition-all duration-200 hover:shadow-md ${
              notification.severity === 'warning'
                ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20'
                : 'border-blue-200 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20'
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 p-2 rounded-lg ${
                    notification.severity === 'warning'
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                  }`}
                >
                  {notification.type === 'unpaid_fee' ? (
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm sm:text-base text-foreground line-clamp-1">
                        {notification.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {notification.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      <Link to={notification.link}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs hover:bg-background/80"
                        >
                          View
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80"
                        onClick={() => handleDismiss(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {notification.count && notification.count > 1 && (
                    <Badge
                      variant="outline"
                      className={`mt-2 text-[10px] ${
                        notification.severity === 'warning'
                          ? 'border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400'
                          : 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {notification.count} {notification.type === 'unpaid_fee' ? 'students' : 'ready'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {visibleNotifications.length > 5 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            +{visibleNotifications.length - 5} more notifications
          </p>
        )}
      </div>
    </div>
  );
}
