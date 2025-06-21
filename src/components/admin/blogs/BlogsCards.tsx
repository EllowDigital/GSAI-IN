
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;

interface BlogsCardsProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (id: string) => void;
  isDeleting: (id: string) => boolean;
  formatDate: (date: string | null) => string;
}

export default function BlogsCards({
  blogs,
  onEdit,
  onDelete,
  isDeleting,
  formatDate,
}: BlogsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {blogs.map((blog) => (
        <Card key={blog.id} className="rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
          <CardContent className="p-4">
            {blog.image_url && (
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3"
              />
            )}
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight">
                {blog.title}
              </h3>
              {blog.description && (
                <p className="text-sm text-gray-600 line-clamp-3">
                  {blog.description}
                </p>
              )}
              <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
                <span>Published</span>
                <span>{formatDate(blog.published_at)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Updated</span>
                <span>{formatDate(blog.updated_at)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(blog)}
                  className="flex-1 rounded-full text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(blog.id)}
                  disabled={isDeleting(blog.id)}
                  className="flex-1 rounded-full text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  {isDeleting(blog.id) ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
