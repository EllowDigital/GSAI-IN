import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Award } from 'lucide-react';
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
  white: 'bg-slate-100 text-slate-800 border-slate-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  orange: 'bg-orange-100 text-orange-800 border-orange-400',
  green: 'bg-green-100 text-green-800 border-green-400',
  blue: 'bg-blue-100 text-blue-800 border-blue-400',
  brown: 'bg-amber-700 text-white border-amber-800',
  black: 'bg-slate-900 text-white border-slate-700',
};

function getBeltColorClass(color: string): string {
  return BELT_COLORS[color.toLowerCase()] || 'bg-muted text-muted-foreground';
}

const InfoRow = ({ label, value }: { label: string; value: string | null }) => (
  <div className="flex justify-between text-sm">
    <span className="font-medium text-muted-foreground">{label}:</span>
    <span className="text-foreground truncate">{value || '-'}</span>
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

  useEffect(() => {
    const fetchBelts = async () => {
      if (students.length === 0) return;

      const { data, error } = await supabase
        .from('student_progress')
        .select(
          `
          student_id,
          belt_levels:belt_levels(color, rank)
        `
        )
        .in(
          'student_id',
          students.map((s) => s.id)
        );

      if (!error && data) {
        const beltMap = new Map(
          data.map((item) => [
            item.student_id,
            {
              color: item.belt_levels?.color,
              rank: item.belt_levels?.rank,
            },
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
        setStudentsWithBelts(
          students.map((s) => ({ ...s, belt_color: 'White', belt_rank: 1 }))
        );
      }
    };

    fetchBelts();
  }, [students]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (studentsWithBelts.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">No students found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {studentsWithBelts.map((stu) => (
        <Card
          key={stu.id}
          className="shadow-md hover:shadow-lg transition-shadow bg-white"
        >
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  {stu.profile_image_url ? (
                    <AvatarImage
                      src={stu.profile_image_url}
                      alt={stu.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-yellow-100">
                      <User size={24} className="text-yellow-600" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {stu.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {stu.program}
                    </p>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getBeltColorClass(stu.belt_color ?? 'white')}`}
                    >
                      <Award className="h-3 w-3" />
                      {stu.belt_color}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(stu)}
                  className="w-8 h-8 rounded-full"
                  aria-label="Edit"
                >
                  <Edit size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => onDelete(stu)}
                  className="w-8 h-8 rounded-full"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            <div className="border-t pt-3 space-y-1.5">
              <InfoRow label="Aadhar" value={stu.aadhar_number} />
              <InfoRow
                label="Joined"
                value={
                  stu.join_date
                    ? new Date(stu.join_date).toLocaleDateString()
                    : ''
                }
              />
              <InfoRow label="Parent" value={stu.parent_name} />
              <InfoRow label="Contact" value={stu.parent_contact} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
