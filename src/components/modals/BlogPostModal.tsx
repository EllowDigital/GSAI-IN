import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  description: string | null;
  content: string;
  image_url: string | null;
  published_at: string | null;
}

interface BlogPostModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullPage: (id: string) => void;
}

export function BlogPostModal({
  post,
  isOpen,
  onClose,
  onViewFullPage,
}: BlogPostModalProps) {
  const isMobile = useIsMobile();

  if (!post) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const content = (
    <div className="space-y-6">
      {post.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {post.title}
          </h2>
          {post.published_at && (
            <p className="text-sm text-gray-400">
              Published on {formatDate(post.published_at)}
            </p>
          )}
        </div>

        {post.description && (
          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-yellow-500">
            <p className="text-gray-300 font-medium">
              {post.description}
            </p>
          </div>
        )}

        <div className="prose prose-sm max-w-none prose-invert">
          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={() => onViewFullPage(post.id)}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700"
          >
            View Full Article
          </Button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] bg-[#0a0a0a] border-white/10 text-white">
          <DrawerHeader className="text-left">
            <DrawerClose className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border-white/10 text-white">
        <DialogHeader className="sr-only">
          <DialogTitle>{post.title}</DialogTitle>
          <DialogDescription>
            {post.description || 'Blog article preview'}{' '}
            {post.published_at &&
              `Published on ${formatDate(post.published_at)}.`}
          </DialogDescription>
        </DialogHeader>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
        {content}
      </DialogContent>
    </Dialog>
  );
}
