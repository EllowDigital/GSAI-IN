import React, { useState, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  User,
  ChevronsUpDown,
  Phone,
  Calendar,
  GraduationCap,
  CreditCard,
  Award,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/services/supabase/client';
import { useAllStudentPrograms } from '@/hooks/useStudentPrograms';
import { StudentTableSkeleton } from '../AdminSkeletons';

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
  sortConfig: {
    key: 'name' | 'program' | 'join_date';
    direction: 'asc' | 'desc';
  };
  requestSort: (key: 'name' | 'program' | 'join_date') => void;
};

const SortableHeader = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  direction: string;
  onClick: () => void;
}) => (
  <TableHead
    className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
    onClick={onClick}
  >
    <div className="flex items-center gap-1.5">
      {children}
      <ChevronsUpDown
        className={cn(
          'h-3.5 w-3.5 transition-all',
          active ? 'opacity-100 text-primary' : 'opacity-30'
        )}
      />
    </div>
  </TableHead>
);

export default function StudentsTable({
  students,
  onEdit,
  onDelete,
  loading,
  sortConfig,
  requestSort,
}: Props) {
  const [studentsWithBelts, setStudentsWithBelts] = useState<StudentWithBelt[]>(
    []
  );
  const { data: programsMap = new Map<string, string[]>() } =
    useAllStudentPrograms(students.map((s) => s.id));

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

  if (loading) return <StudentTableSkeleton />;

  if (studentsWithBelts.length === 0 && !loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card py-16 text-center">
        <div className="w-14 h-14 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">
          No students found
        </h3>
        <p className="text-sm text-muted-foreground">
          Add your first student to get started
        </p>
      </div>
    );
  }

  return (
    <Table className="min-w-[900px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[60px]" />
          <SortableHeader
            active={sortConfig.key === 'name'}
            direction={sortConfig.direction}
            onClick={() => requestSort('name')}
          >
            Name
          </SortableHeader>
          <TableHead className="min-w-[130px]">Aadhar</TableHead>
          <SortableHeader
            active={sortConfig.key === 'program'}
            direction={sortConfig.direction}
            onClick={() => requestSort('program')}
          >
            Programs
          </SortableHeader>
          <TableHead className="min-w-[90px]">Belt</TableHead>
          <SortableHeader
            active={sortConfig.key === 'join_date'}
            direction={sortConfig.direction}
            onClick={() => requestSort('join_date')}
          >
            Joined
          </SortableHeader>
          <TableHead className="min-w-[120px]">Parent</TableHead>
          <TableHead className="min-w-[120px]">Contact</TableHead>
          <TableHead className="w-[100px] text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {studentsWithBelts.map((stu, index) => {
          const allPrograms = (programsMap as Map<string, string[]>).get(
            stu.id
          ) || [stu.program];
          return (
            <TableRow
              key={stu.id}
              className={cn(
                'group transition-colors',
                index % 2 === 1 ? 'bg-muted/15' : ''
              )}
            >
              <TableCell className="py-2.5">
                <Avatar className="h-9 w-9 ring-1 ring-border">
                  {stu.profile_image_url ? (
                    <AvatarImage
                      src={stu.profile_image_url}
                      alt={stu.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {stu.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="py-2.5">
                <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {stu.name}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {stu.aadhar_number}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex flex-wrap gap-1">
                  {allPrograms.map((prog, i) => (
                    <Badge
                      key={prog}
                      variant={i === 0 ? 'default' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {prog}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <div
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getBeltColorClass(stu.belt_color ?? 'white')}`}
                >
                  <Award className="h-2.5 w-2.5" />
                  {stu.belt_color}
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <span className="text-xs text-muted-foreground">
                  {stu.join_date
                    ? new Date(stu.join_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '--'}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <span className="text-xs text-foreground">
                  {stu.parent_name}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <span className="font-mono text-xs text-muted-foreground">
                  {stu.parent_contact}
                </span>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex gap-1.5 justify-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(stu)}
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(stu)}
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
