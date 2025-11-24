import React from 'react';
import { X, Calendar } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface NewsItem {
  id: string;
  title: string;
  short_description: string | null;
  date: string;
  image_url: string | null;
  status: string | null;
  created_by: string | null;
}

interface NewsModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullPage: (id: string) => void;
}

export function NewsModal({
  news,
  isOpen,
  onClose,
  onViewFullPage,
}: NewsModalProps) {
  const isMobile = useIsMobile();

  if (!news) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const content = (
    <div className="space-y-6">
      {news.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10">
          <img
            src={news.image_url}
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-4 mb-3">
            <h2 className="text-2xl font-bold text-white">{news.title}</h2>
            {news.status && (
              <Badge
                variant={news.status === 'published' ? 'default' : 'secondary'}
                className="shrink-0 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
              >
                {news.status}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{formatDate(news.date)}</span>
          </div>
        </div>

        {news.short_description && (
          <div className="p-4 bg-white/5 rounded-lg border-l-4 border-yellow-500">
            <p className="text-gray-300 leading-relaxed">
              {news.short_description}
            </p>
          </div>
        )}

        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
          <p className="text-sm text-blue-200">
            <strong>Stay Updated:</strong> Follow our latest news and
            announcements to never miss important updates from Ghatak Sports
            Academy India.
          </p>
        </div>

        {news.created_by && (
          <div className="text-xs text-gray-500">
            Published by: {news.created_by}
          </div>
        )}

        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={() => onViewFullPage(news.id)}
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-red-600 text-white border-0 hover:from-yellow-600 hover:to-red-700"
          >
            View Full News Article
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
          <DialogTitle>{news.title}</DialogTitle>
          <DialogDescription>
            Published on {formatDate(news.date)}.{' '}
            {news.short_description || 'Expanded news preview for admins.'}
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
