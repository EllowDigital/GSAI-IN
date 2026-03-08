import React from 'react';
import { useStudentAuth } from '@/pages/student/StudentAuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { CalendarDays, Award, Dumbbell, User } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

const BELT_COLORS: Record<string, string> = {
  white: 'bg-gray-100 text-gray-800 border-gray-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
  green: 'bg-green-100 text-green-800 border-green-400',
  blue: 'bg-blue-100 text-blue-800 border-blue-400',
  purple: 'bg-purple-100 text-purple-800 border-purple-400',
  brown: 'bg-amber-100 text-amber-900 border-amber-600',
  red: 'bg-red-100 text-red-800 border-red-400',
  black: 'bg-gray-900 text-white border-gray-700',
};

export default function StudentProfileCard() {
  const { profile } = useStudentAuth();

  const { data: student, isLoading } = useQuery({
    queryKey: ['student-profile', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('name, program, join_date, profile_image_url')
        .eq('id', profile!.studentId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  const { data: currentBelt } = useQuery({
    queryKey: ['student-belt', profile?.studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_progress')
        .select('belt_level_id, stripe_count, belt_levels(color, rank)')
        .eq('student_id', profile!.studentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle() as any;
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.studentId,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner size={20} /></div>;
  if (!student) return null;

  const beltColor = currentBelt?.belt_levels?.color?.toLowerCase() || 'white';
  const beltStyle = BELT_COLORS[beltColor] || BELT_COLORS.white;
  const initials = student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="border border-border overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header */}
        <div className="bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-4">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarImage src={student.profile_image_url || ''} alt={student.name} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
            <p className="text-sm text-muted-foreground font-mono">{profile?.loginId}</p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Dumbbell className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Program</p>
              <p className="text-sm font-semibold text-foreground">{student.program}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CalendarDays className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-semibold text-foreground">
                {format(new Date(student.join_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Award className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Current Belt</p>
              <Badge variant="outline" className={`${beltStyle} border capitalize`}>
                {beltColor} Belt
                {currentBelt?.stripe_count > 0 && ` • ${currentBelt.stripe_count} stripe${currentBelt.stripe_count > 1 ? 's' : ''}`}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
