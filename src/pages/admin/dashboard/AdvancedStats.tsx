import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdvancedStats() {
  const { data: studentsData } = useQuery({
    queryKey: ['students-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('program, join_date');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ['events-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('from_date')
        .gte('from_date', new Date().toISOString().split('T')[0]);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: feesData } = useQuery({
    queryKey: ['fees-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('paid_amount, status, year');
      if (error) throw error;
      return data || [];
    },
  });

  // Process students by program
  const studentsByProgram = React.useMemo(() => {
    if (!studentsData) return [];
    const programCounts: Record<string, number> = {};
    studentsData.forEach((student) => {
      programCounts[student.program] =
        (programCounts[student.program] || 0) + 1;
    });
    return Object.entries(programCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [studentsData]);

  // Process monthly enrollments
  const monthlyEnrollments = React.useMemo(() => {
    if (!studentsData) return [];
    const monthlyCounts: Record<string, number> = {};
    studentsData.forEach((student) => {
      const month = new Date(student.join_date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });
    return Object.entries(monthlyCounts)
      .map(([month, students]) => ({ month, students }))
      .slice(-6);
  }, [studentsData]);

  // Calculate total revenue
  const totalRevenue = React.useMemo(() => {
    if (!feesData) return 0;
    return feesData
      .filter((fee) => fee.status === 'paid')
      .reduce((sum, fee) => sum + fee.paid_amount, 0);
  }, [feesData]);

  const stats = [
    {
      title: 'Total Students',
      value: studentsData?.length || 0,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Upcoming Events',
      value: eventsData?.length || 0,
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Active Programs',
      value: studentsByProgram.length,
      icon: BookOpen,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-yellow-600 drop-shadow">
          Advanced Analytics
        </h1>
        <p className="mt-1 text-sm md:text-base text-gray-500 font-medium">
          Detailed insights and statistics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Enrollments */}
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Monthly Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={12} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Students by Program */}
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Students by Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentsByProgram}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentsByProgram.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
