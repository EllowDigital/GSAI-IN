import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, ChevronsUpDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import clsx from 'clsx';

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
  <TableHead className="cursor-pointer" onClick={onClick}>
    <div className="flex items-center gap-1">
      {children}
      <ChevronsUpDown
        className={`h-4 w-4 transition-opacity ${active ? 'opacity-100 text-black' : 'opacity-40'}`}
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
  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={8}>
          <div className="py-8 flex items-center justify-center">
            <span className="animate-spin w-7 h-7 rounded-full border-4 border-yellow-300 border-t-transparent inline-block mr-2" />
            Loading students...
          </div>
        </TableCell>
      </TableRow>
    );
  }

  if (students.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={8}>
          <div className="py-10 text-center text-gray-400">
            No students found.
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <div className="rounded-2xl shadow-lg overflow-x-auto bg-white scrollbar-thin scrollbar-thumb-yellow-200 scrollbar-track-yellow-50">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[60px]">Avatar</TableHead>
            <SortableHeader
              active={sortConfig.key === 'name'}
              direction={sortConfig.direction}
              onClick={() => requestSort('name')}
            >
              Name
            </SortableHeader>
            <TableHead className="min-w-[130px]">Aadhar Number</TableHead>
            <SortableHeader
              active={sortConfig.key === 'program'}
              direction={sortConfig.direction}
              onClick={() => requestSort('program')}
            >
              Program
            </SortableHeader>
            <SortableHeader
              active={sortConfig.key === 'join_date'}
              direction={sortConfig.direction}
              onClick={() => requestSort('join_date')}
            >
              Join Date
            </SortableHeader>
            <TableHead className="min-w-[120px]">Parent Name</TableHead>
            <TableHead className="min-w-[120px]">Parent Contact</TableHead>
            <TableHead className="min-w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((stu, index) => (
            <TableRow
              key={stu.id}
              className={clsx(
                'transition',
                'hover:bg-yellow-50',
                index % 2 === 1 ? 'bg-gray-50' : 'bg-white'
              )}
            >
              <TableCell>
                <Avatar className="h-9 w-9">
                  {stu.profile_image_url ? (
                    <AvatarImage
                      src={stu.profile_image_url}
                      alt={stu.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="bg-yellow-100">
                      <User size={18} className="text-yellow-600" />
                    </AvatarFallback>
                  )}
                </Avatar>
              </TableCell>
              <TableCell className="font-semibold">{stu.name}</TableCell>
              <TableCell>{stu.aadhar_number}</TableCell>
              <TableCell>
                <span className="block max-w-[100px] truncate">
                  {stu.program}
                </span>
              </TableCell>
              <TableCell>
                {stu.join_date
                  ? new Date(stu.join_date).toLocaleDateString()
                  : ''}
              </TableCell>
              <TableCell>
                <span className="block max-w-[110px] truncate">
                  {stu.parent_name}
                </span>
              </TableCell>
              <TableCell>
                <span className="block max-w-[110px] truncate">
                  {stu.parent_contact}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(stu)}
                    className="rounded-full"
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(stu)}
                    className="rounded-full"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
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
