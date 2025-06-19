import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface StudentStats {
  total: number;
  byProgram: Record<string, number>;
}

interface FeesStats {
  totalFees: number;
  monthlyRecurring: number;
}

interface EnrollmentStats {
  monthlyEnrollment: number;
}

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month, 0).getDate();
};

export default function AdvancedStats() {
  const { data: studentStats, isLoading: studentsLoading } = useQuery({
    queryKey: ['advanced-student-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('program, created_at');
      if (error) throw error;
      
      const total = data?.length || 0;
      const byProgram: Record<string, number> = {};
      
      if (Array.isArray(data)) {
        data.forEach((student) => {
          if (student.program) {
            byProgram[student.program] = (byProgram[student.program] || 0) + 1;
          }
        });
      }
      
      return { total, byProgram };
    },
  });

  const { data: feesStats, isLoading: feesLoading } = useQuery({
    queryKey: ['advanced-fees-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('monthly_fee, paid_amount');
      if (error) throw error;
      
      let totalFees = 0;
      let monthlyRecurring = 0;
      
      if (Array.isArray(data)) {
        data.forEach((fee) => {
          totalFees += fee.paid_amount || 0;
          monthlyRecurring += fee.monthly_fee || 0;
        });
      }
      
      return { totalFees, monthlyRecurring };
    },
  });

  const { data: enrollmentStats, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['advanced-enrollment-stats'],
    queryFn: async () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const daysInMonth = getDaysInMonth(currentMonth, currentYear);

      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${daysInMonth}`;

      const { data, error } = await supabase
        .from('students')
        .select('created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (error) throw error;
      const monthlyEnrollment = data?.length || 0;
      return { monthlyEnrollment };
    },
  });

  return (
    <div className="space-y-6">
      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Students
          </CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {studentsLoading ? '...' : studentStats?.total}
          </div>
          <p className="text-xs text-gray-500">
            {studentStats?.byProgram &&
              Object.entries(studentStats.byProgram).map(
                ([program, count]) => (
                  <span key={program}>
                    {program}: {count}{' '}
                  </span>
                )
              )}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Fees Collected
          </CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{feesLoading ? '...' : feesStats?.totalFees}
          </div>
          <p className="text-xs text-gray-500">
            ₹{feesStats?.monthlyRecurring} monthly recurring
          </p>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            New Enrollments (This Month)
          </CardTitle>
          <Calendar className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {enrollmentLoading ? '...' : enrollmentStats?.monthlyEnrollment}
          </div>
          <p className="text-xs text-gray-500">
            Tracking new students this month
          </p>
        </CardContent>
      </Card>

      <Card className="shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Future Prediction
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">TBD</div>
          <p className="text-xs text-gray-500">
            Based on current enrollment trends
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
