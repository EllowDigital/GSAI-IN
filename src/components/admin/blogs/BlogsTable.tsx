
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
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">
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
              <TableHead className="w-32">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Date
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center min-w-[140px]">Actions</TableHead>
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
                        className="h-16 w-28 object-cover transition-transform duration-200 group-hover:scale-105"
                        style={{ minWidth: '112px' }}
                      />
                    ) : (
                      <div className="h-16 w-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-lg">
                        <Image className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                      {blog.title}
                    </h3>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                      {blog.published_at ? formatDate(blog.published_at) : '--'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed" title={blog.description ?? ''}>
                    {blog.description || 'No description available'}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(blog)}
                      className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group/btn"
                      aria-label="Edit blog"
                    >
                      <Edit className="w-4 h-4 text-slate-600 group-hover/btn:text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(blog.id)}
                      className="h-9 w-9 rounded-xl border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 group/btn"
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
