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
import clsx from 'clsx';
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
  sortConfig: {
    key: 'name' | 'program' | 'join_date';
    direction: 'asc' | 'desc';
  };
  requestSort: (key: 'name' | 'program' | 'join_date') => void;
};

const SortableHeader = ({
  children,
  active,
  direction,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  direction: string;
  onClick: () => void;
}) => (
  <TableHead
    className="cursor-pointer hover:bg-slate-100/50 transition-colors duration-200"
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      {children}
      <ChevronsUpDown
        className={`h-4 w-4 transition-all duration-200 ${
          active
            ? 'opacity-100 text-blue-600 scale-110'
            : 'opacity-40 group-hover:opacity-60'
        }`}
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="py-16 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <div className="absolute inset-0 h-12 w-12 border-4 border-blue-100 rounded-full opacity-20"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading students...</p>
        </div>
      </div>
    );
  }

  if (studentsWithBelts.length === 0 && !loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            No students found
          </h3>
          <p className="text-slate-500">
            Add your first student to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[80px]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Avatar
              </div>
            </TableHead>
            <SortableHeader
              active={sortConfig.key === 'name'}
              direction={sortConfig.direction}
              onClick={() => requestSort('name')}
            >
              <User className="w-4 h-4 text-slate-500" />
              Name
            </SortableHeader>
            <TableHead className="min-w-[140px]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-500" />
                Aadhar Number
              </div>
            </TableHead>
            <SortableHeader
              active={sortConfig.key === 'program'}
              direction={sortConfig.direction}
              onClick={() => requestSort('program')}
            >
              <GraduationCap className="w-4 h-4 text-slate-500" />
              Program
            </SortableHeader>
            <TableHead className="min-w-[100px]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-slate-500" />
                Belt
              </div>
            </TableHead>
            <SortableHeader
              active={sortConfig.key === 'join_date'}
              direction={sortConfig.direction}
              onClick={() => requestSort('join_date')}
            >
              <Calendar className="w-4 h-4 text-slate-500" />
              Join Date
            </SortableHeader>
            <TableHead className="min-w-[140px]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Parent Name
              </div>
            </TableHead>
            <TableHead className="min-w-[140px]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                Contact
              </div>
            </TableHead>
            <TableHead className="min-w-[120px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentsWithBelts.map((stu, index) => (
            <TableRow
              key={stu.id}
              className={clsx(
                'group transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20',
                index % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
              )}
            >
              <TableCell>
                <Avatar className="h-11 w-11 ring-2 ring-slate-200 group-hover:ring-blue-300 transition-all duration-200">
                  {stu.profile_image_url ? (
                    <AvatarImage
                      src={stu.profile_image_url}
                      alt={stu.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold">
                      {stu.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                    {stu.name}
                  </h3>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-mono text-sm text-slate-600">
                    {stu.aadhar_number}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                  {stu.program}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="gap-1">
                  <Award className="h-3 w-3" />
                  {stu.belt_color}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-600">
                    {stu.join_date
                      ? new Date(stu.join_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '--'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-slate-700 line-clamp-1">
                  {stu.parent_name}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-slate-600">
                  {stu.parent_contact}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(stu)}
                    className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group/btn"
                    aria-label="Edit student"
                  >
                    <Edit className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-600" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(stu)}
                    className="h-9 w-9 rounded-xl border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group/btn"
                    aria-label="Delete student"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
