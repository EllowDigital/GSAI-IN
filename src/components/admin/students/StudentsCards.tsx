import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Award, Calendar, Phone, Users } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

type StudentRow = {
  id: string;
  name: string;
  aadhar_number: string;
  program: string;
  join_date: string;
  parent_name: string;
  parent_contact: string;
  profile_image_url: string | null;
  created_at: string | null;
};

type StudentWithBelt = StudentRow & {
  belt_color?: string;
  belt_rank?: number;
};

type Props = {
  students: StudentRow[];
  onEdit: (student: StudentRow) => void;
  onDelete: (student: StudentRow) => void;
  loading: boolean;
};

const BELT_COLORS: Record<string, string> = {
  white: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-400 dark:border-yellow-600',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-400 dark:border-orange-600',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-400 dark:border-green-600',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-400 dark:border-blue-600',
  brown: 'bg-amber-700 text-white border-amber-800',
  black: 'bg-slate-900 dark:bg-slate-950 text-white border-slate-700',
};

function getBeltColorClass(color: string): string {
  return BELT_COLORS[color.toLowerCase()] || 'bg-muted text-muted-foreground border-border';
}

const InfoRow = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string | null }) => (
  <div className="flex items-center gap-2 text-xs sm:text-sm">
    {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
    <span className="text-muted-foreground">{label}:</span>
    <span className="text-foreground truncate ml-auto font-medium">{value || '-'}</span>
  </div>
);

export default function StudentsCards({ students, onEdit, onDelete, loading }: Props) {
  const [studentsWithBelts, setStudentsWithBelts] = useState<StudentWithBelt[]>([]);

  useEffect(() => {
    const fetchBelts = async () => {
      if (students.length === 0) return;

      const { data, error } = await supabase
        .from('student_progress')
        .select(`student_id, belt_levels:belt_levels(color, rank)`)
        .in('student_id', students.map((s) => s.id));

      if (!error && data) {
        const beltMap = new Map(
          data.map((item) => [
            item.student_id,
            { color: item.belt_levels?.color, rank: item.belt_levels?.rank },
          ])
        );

        setStudentsWithBelts(
          students.map((student) => ({
            ...student,
            belt_color: beltMap.get(student.id)?.color || 'White',
            belt_rank: beltMap.get(student.id)?.rank || 1,
          }))
        );
      } else {
        setStudentsWithBelts(students.map((s) => ({ ...s, belt_color: 'White', belt_rank: 1 })));
      }
    };

    fetchBelts();
  }, [students]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse bg-card">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (studentsWithBelts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No students found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {studentsWithBelts.map((stu) => (
        <Card
          key={stu.id}
          className="group rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11 sm:h-14 sm:w-14 ring-2 ring-offset-2 ring-primary/10 flex-shrink-0">
                {stu.profile_image_url ? (
                  <AvatarImage src={stu.profile_image_url} alt={stu.name} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                    {stu.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{stu.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stu.program}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${getBeltColorClass(stu.belt_color ?? 'white')}`}>
                    <Award className="h-3 w-3" />
                    {stu.belt_color}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(stu)}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  aria-label="Edit"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(stu)}
                  className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="p-2.5 sm:p-3 bg-muted/30 rounded-lg space-y-2 border border-border/30">
              <InfoRow icon={Calendar} label="Joined" value={stu.join_date ? new Date(stu.join_date).toLocaleDateString() : null} />
              <InfoRow icon={User} label="Parent" value={stu.parent_name} />
              <InfoRow icon={Phone} label="Contact" value={stu.parent_contact} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
