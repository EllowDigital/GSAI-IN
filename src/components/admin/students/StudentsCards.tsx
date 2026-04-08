import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  User,
  Award,
  Calendar,
  Phone,
  Users,
  KeyRound,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/services/supabase/client';
import { useQuery } from '@tanstack/react-query';
import CreatePortalAccountDialog from '../CreatePortalAccountDialog';
import { useAllStudentPrograms } from '@/hooks/useStudentPrograms';
import { StudentCardsGridSkeleton } from '../AdminSkeletons';

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
  default_monthly_fee: number;
  discount_percent: number;
};
type StudentWithBelt = StudentRow & { belt_color?: string; belt_rank?: number };

type Props = {
  students: StudentRow[];
  onEdit: (student: StudentRow) => void;
  onDelete: (student: StudentRow) => void;
  loading: boolean;
};

const BELT_COLORS: Record<string, string> = {
  white: 'bg-muted text-foreground border-border',
  yellow:
    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-400/50',
  orange:
    'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-400/50',
  green:
    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-400/50',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-400/50',
  brown: 'bg-amber-700 text-white border-amber-800',
  black: 'bg-foreground text-background border-foreground',
};

function getBeltColorClass(color: string): string {
  return (
    BELT_COLORS[color.toLowerCase()] ||
    'bg-muted text-muted-foreground border-border'
  );
}

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | null;
}) => (
  <div className="flex items-center gap-2 text-xs">
    {Icon && <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
    <span className="text-muted-foreground">{label}:</span>
    <span className="text-foreground truncate ml-auto font-medium">
      {value || '-'}
    </span>
  </div>
);

export default function StudentsCards({
  students,
  onEdit,
  onDelete,
  loading,
}: Props) {
  const [studentsWithBelts, setStudentsWithBelts] = useState<StudentWithBelt[]>(
    []
  );
  const [portalStudent, setPortalStudent] = useState<{
    id: string;
    name: string;
    program: string;
  } | null>(null);

  const { data: programsMap = new Map<string, string[]>() } =
    useAllStudentPrograms(students.map((s) => s.id));
  const { data: portalAccountIds = new Set<string>() } = useQuery({
    queryKey: ['students-portal-status'],
    queryFn: async () => {
      const { data, error } = (await supabase
        .from('student_portal_accounts')
        .select('student_id')) as any;
      if (error) return new Set<string>();
      return new Set<string>((data || []).map((r: any) => r.student_id));
    },
    staleTime: 30000,
  });

  useEffect(() => {
    const fetchBelts = async () => {
      if (students.length === 0) return;
      const { data, error } = await supabase
        .from('student_progress')
        .select(`student_id, belt_levels:belt_levels(color, rank)`)
        .in(
          'student_id',
          students.map((s) => s.id)
        );
      if (!error && data) {
        const beltMap = new Map(
          data.map((item) => [
            item.student_id,
            { color: item.belt_levels?.color, rank: item.belt_levels?.rank },
          ])
        );
        setStudentsWithBelts(
          students.map((s) => ({
            ...s,
            belt_color: beltMap.get(s.id)?.color || 'White',
            belt_rank: beltMap.get(s.id)?.rank || 1,
          }))
        );
      } else {
        setStudentsWithBelts(
          students.map((s) => ({ ...s, belt_color: 'White', belt_rank: 1 }))
        );
      }
    };
    fetchBelts();
  }, [students]);

  if (loading) return <StudentCardsGridSkeleton />;

  if (studentsWithBelts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-14 h-14 mx-auto bg-muted rounded-full flex items-center justify-center mb-3">
          <Users className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No students found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {studentsWithBelts.map((stu) => {
          const allPrograms = (programsMap as Map<string, string[]>).get(
            stu.id
          ) || [stu.program];
          return (
            <Card
              key={stu.id}
              className="group rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <CardContent className="p-3 sm:p-4 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-1 ring-border flex-shrink-0">
                    {stu.profile_image_url ? (
                      <AvatarImage
                        src={stu.profile_image_url}
                        alt={stu.name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {stu.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                      {stu.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {allPrograms.map((prog, i) => (
                        <Badge
                          key={prog}
                          variant={i === 0 ? 'default' : 'secondary'}
                          className="text-[9px] px-1.5 py-0"
                        >
                          {prog}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-1.5">
                      <div
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${getBeltColorClass(stu.belt_color ?? 'white')}`}
                      >
                        <Award className="h-2.5 w-2.5" />
                        {stu.belt_color}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!(portalAccountIds as Set<string>).has(stu.id) ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          setPortalStudent({
                            id: stu.id,
                            name: stu.name,
                            program: stu.program,
                          })
                        }
                        className="h-7 w-7 rounded-lg"
                        title="Create Portal Account"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-5 px-1 border-emerald-500/30 text-emerald-600"
                      >
                        Portal ✓
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onEdit(stu)}
                      className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onDelete(stu)}
                      className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-2 bg-muted/20 rounded-lg space-y-1.5 border border-border/20">
                  <InfoRow
                    icon={Calendar}
                    label="Joined"
                    value={
                      stu.join_date
                        ? new Date(stu.join_date).toLocaleDateString()
                        : null
                    }
                  />
                  <InfoRow icon={User} label="Parent" value={stu.parent_name} />
                  <InfoRow
                    icon={Phone}
                    label="Contact"
                    value={stu.parent_contact}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <CreatePortalAccountDialog
        open={!!portalStudent}
        onOpenChange={(val) => {
          if (!val) setPortalStudent(null);
        }}
        student={portalStudent}
      />
    </>
  );
}
