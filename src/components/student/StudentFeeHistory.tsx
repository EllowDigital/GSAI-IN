import React from 'react';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, IndianRupee, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  paid: { icon: CheckCircle2, label: 'Paid', className: 'bg-green-500/10 text-green-600' },
  partial: { icon: Clock, label: 'Partial', className: 'bg-yellow-500/10 text-yellow-600' },
  unpaid: { icon: AlertCircle, label: 'Unpaid', className: 'bg-red-500/10 text-red-600' },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StudentFeeHistory() {
  const { profile } = useStudentAuth();

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['student-fees', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fees')
        .select('*')
        .eq('student_id', profile!.studentId)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size={20} /></div>;

  if (fees.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-8">No fee records found.</p>
    );
  }

  // Summary
  const totalDue = fees.reduce((sum, f) => sum + (f.balance_due || 0), 0);
  const totalPaid = fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <IndianRupee className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-lg font-bold text-foreground">₹{totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance Due</p>
              <p className="text-lg font-bold text-foreground">₹{totalDue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      {fees.map((fee) => {
        const config = STATUS_CONFIG[fee.status || 'unpaid'] || STATUS_CONFIG.unpaid;
        const Icon = config.icon;
        return (
          <Card key={fee.id} className="border border-border">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${config.className}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {MONTH_NAMES[fee.month - 1]} {fee.year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₹{fee.paid_amount} / ₹{fee.monthly_fee}
                    {fee.balance_due > 0 && (
                      <span className="text-red-500 ml-1">• Due: ₹{fee.balance_due}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className={config.className}>
                  {config.label}
                </Badge>
                {fee.receipt_url && (
                  <a href={fee.receipt_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
