
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;

interface BlogsTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: string) => void;
  isDeleting: (blogId: string) => boolean;
  formatDate: (date: string | null) => string;
}

export default function BlogsTable({
  blogs,
  onEdit,
  onDelete,
  isDeleting,
  formatDate,
}: BlogsTableProps) {
  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead className="w-36">Thumbnail</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right min-w-[110px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {blogs.map((blog) => (
          <TableRow key={blog.id} className="hover:bg-yellow-50 transition">
            <TableCell>
              {blog.image_url ? (
                <img
                  src={blog.image_url}
                  alt={blog.title}
                  className="h-14 w-24 object-cover rounded-lg shadow"
                  style={{ minWidth: '96px' }}
                />
              ) : (
                <span className="italic text-gray-400">No Image</span>
              )}
            </TableCell>
            <TableCell className="font-semibold max-w-[140px] overflow-auto">
              {blog.title}
            </TableCell>
            <TableCell className="whitespace-nowrap">
              {blog.published_at ? formatDate(blog.published_at) : '--'}
            </TableCell>
            <TableCell
              className="max-w-[220px] truncate"
              title={blog.description ?? ''}
            >
              {blog.description}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(blog)}
                  className="rounded-full"
                  aria-label="Edit"
                >
                  <Edit />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(blog.id)}
                  className="rounded-full"
                  aria-label="Delete"
                  disabled={isDeleting(blog.id)}
                >
                  {isDeleting(blog.id) ? (
                    <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4" />
                  ) : (
                    <Trash2 />
                  )}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
