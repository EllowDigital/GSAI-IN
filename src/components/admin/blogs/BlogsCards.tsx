
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;

interface BlogsCardsProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blogId: string) => void;
  isDeleting: (blogId: string) => boolean;
  formatDate: (date: string) => string;
}

export default function BlogsCards({ blogs, onEdit, onDelete, isDeleting, formatDate }: BlogsCardsProps) {
  return (
    <div className="grid xs:grid-cols-2 gap-4 sm:gap-6">
      {blogs.map((blog) => (
        <Card key={blog.id} className="rounded-xl shadow-lg bg-white flex flex-col gap-3 p-4 relative">
          {blog.image_url ? (
            <img
              src={blog.image_url}
              alt={blog.title}
              className="w-full h-28 xs:h-28 sm:h-32 object-cover rounded-md shadow mb-2"
            />
          ) : (
            <div className="w-full h-28 xs:h-28 sm:h-32 bg-yellow-50 text-yellow-300 rounded-md flex items-center justify-center mb-2">No Image</div>
          )}
          <div className="flex items-start gap-2 justify-between mb-1 mt-1">
            <div>
              <div className="font-bold text-base leading-tight mb-0.5 text-gray-800 truncate">{blog.title}</div>
              <div className="text-xs text-gray-500 mb-1">{blog.published_at ? formatDate(blog.published_at) : "--"}</div>
              <div className="text-sm text-gray-700">{blog.description}</div>
            </div>
            <div className="flex flex-col gap-2 ml-auto">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full mb-2"
                onClick={() => onEdit(blog)}
                aria-label="Edit"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full"
                onClick={() => onDelete(blog.id)}
                aria-label="Delete"
                disabled={isDeleting(blog.id)}
              >
                {isDeleting(blog.id) ? (
                  <div className="animate-spin border-2 border-t-transparent border-white rounded-full w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
