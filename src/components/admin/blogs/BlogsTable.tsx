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
import { Edit, Trash2, Calendar, FileText, Image } from 'lucide-react';
import { Tables } from '@/services/supabase/types';

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
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 sm:w-40">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-slate-500" />
                  Thumbnail
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Title
                </div>
              </TableHead>
              <TableHead className="w-28 sm:w-32">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Date
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center min-w-[140px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog.id} className="group">
                <TableCell>
                  <div className="relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200">
                    {blog.image_url ? (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="h-14 w-24 min-w-[96px] object-cover transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-28 sm:min-w-[112px]"
                      />
                    ) : (
                      <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 sm:h-16 sm:w-28">
                        <Image className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-blue-600 sm:text-[15px]">
                      {blog.title}
                    </h3>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="whitespace-nowrap text-[13px] font-medium text-slate-600 sm:text-sm">
                      {blog.published_at ? formatDate(blog.published_at) : '--'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <p
                    className="line-clamp-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm"
                    title={blog.description ?? ''}
                  >
                    {blog.description || 'No description available'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(blog)}
                      className="h-8 w-8 rounded-lg border-slate-200 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 group/btn sm:h-9 sm:w-9"
                      aria-label="Edit blog"
                    >
                      <Edit className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(blog.id)}
                      className="h-8 w-8 rounded-lg border-red-200 transition-all duration-200 hover:border-red-300 hover:bg-red-50 group/btn sm:h-9 sm:w-9"
                      aria-label="Delete blog"
                      disabled={isDeleting(blog.id)}
                    >
                      {isDeleting(blog.id) ? (
                        <div className="animate-spin border-2 border-t-transparent border-red-500 rounded-full w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:text-red-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
