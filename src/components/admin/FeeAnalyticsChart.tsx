import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

type FeeRow = {
  month: number;
  year: number;
  status: string | null;
  paid_amount: number;
  monthly_fee: number;
  balance_due: number;
};

function getLast12Months() {
  const now = new Date();
  const months: { month: number; year: number; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      label: `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
    });
  }
  return months;
}

const STATUS_COLORS = {
  paid: 'hsl(142, 71%, 45%)',
  partial: 'hsl(45, 93%, 47%)',
  unpaid: 'hsl(0, 84%, 60%)',
};

const PIE_COLORS = [
  STATUS_COLORS.paid,
  STATUS_COLORS.partial,
  STATUS_COLORS.unpaid,
];

export default function FeeAnalyticsChart() {
  const last12 = getLast12Months();
  const startMonth = last12[0];

  const { data: fees, isLoading } = useQuery({
    queryKey: ['fees-analytics', startMonth.year, startMonth.month],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('month, year, status, paid_amount, monthly_fee, balance_due')
        .or(
          last12
            .map((m) => `and(month.eq.${m.month},year.eq.${m.year})`)
            .join(',')
        );
      if (error) throw error;
      return (data || []) as FeeRow[];
    },
  });

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 flex items-center justify-center min-h-[300px]">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Build bar chart data
  const barData = last12.map((m) => {
    const monthFees = (fees || []).filter(
      (f) => f.month === m.month && f.year === m.year
    );
    const paid = monthFees.filter((f) => f.status === 'paid').length;
    const partial = monthFees.filter((f) => f.status === 'partial').length;
    const unpaid = monthFees.filter(
      (f) => !f.status || f.status === 'unpaid'
    ).length;
    const totalCollected = monthFees.reduce(
      (s, f) => s + (f.paid_amount || 0),
      0
    );
    const totalDue = monthFees.reduce((s, f) => s + (f.monthly_fee || 0), 0);
    return {
      label: m.label,
      paid,
      partial,
      unpaid,
      totalCollected,
      totalDue,
      collectionRate:
        totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0,
    };
  });

  // Pie chart data for current totals
  const allPaid = (fees || []).filter((f) => f.status === 'paid').length;
  const allPartial = (fees || []).filter((f) => f.status === 'partial').length;
  const allUnpaid = (fees || []).filter(
    (f) => !f.status || f.status === 'unpaid'
  ).length;
  const pieData = [
    { name: 'Paid', value: allPaid },
    { name: 'Partial', value: allPartial },
    { name: 'Unpaid', value: allUnpaid },
  ].filter((d) => d.value > 0);

  const totalCollected = (fees || []).reduce(
    (s, f) => s + (f.paid_amount || 0),
    0
  );
  const totalDue = (fees || []).reduce((s, f) => s + (f.monthly_fee || 0), 0);
  const overallRate =
    totalDue > 0 ? Math.round((totalCollected / totalDue) * 100) : 0;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              Fee Analytics
            </p>
            <p className="text-xs text-muted-foreground">
              Last 12 months payment trends
            </p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Total Collected
            </p>
            <p className="text-lg font-bold text-green-600 mt-1">
              ₹{totalCollected.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Total Due
            </p>
            <p className="text-lg font-bold text-foreground mt-1">
              ₹{totalDue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Outstanding
            </p>
            <p className="text-lg font-bold text-destructive mt-1">
              ₹{(totalDue - totalCollected).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-muted/50 border border-border/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Collection Rate
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-lg font-bold text-green-600">{overallRate}%</p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Monthly Status Breakdown
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barCategoryGap="20%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="paid"
                  name="Paid"
                  fill={STATUS_COLORS.paid}
                  radius={[4, 4, 0, 0]}
                  stackId="stack"
                />
                <Bar
                  dataKey="partial"
                  name="Partial"
                  fill={STATUS_COLORS.partial}
                  radius={[0, 0, 0, 0]}
                  stackId="stack"
                />
                <Bar
                  dataKey="unpaid"
                  name="Unpaid"
                  fill={STATUS_COLORS.unpaid}
                  radius={[4, 4, 0, 0]}
                  stackId="stack"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Overall Distribution
            </p>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
