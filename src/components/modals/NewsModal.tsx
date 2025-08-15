import React from 'react';
import { X, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerClose } from '@/components/ui/drawer';
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

export function NewsModal({ news, isOpen, onClose, onViewFullPage }: NewsModalProps) {
  const isMobile = useIsMobile();

  if (!news) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const content = (
    <div className="space-y-6">
      {news.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
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
            <h2 className="text-2xl font-bold text-foreground">{news.title}</h2>
            {news.status && (
              <Badge 
                variant={news.status === 'published' ? 'default' : 'secondary'}
                className="shrink-0"
              >
                {news.status}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(news.date)}</span>
          </div>
        </div>
        
        {news.short_description && (
          <div className="p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
            <p className="text-muted-foreground leading-relaxed">
              {news.short_description}
            </p>
          </div>
        )}
        
        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Stay Updated:</strong> Follow our latest news and announcements to never miss important updates from Ghatak Sports Academy India.
          </p>
        </div>
        
        {news.created_by && (
          <div className="text-xs text-muted-foreground">
            Published by: {news.created_by}
          </div>
        )}
        
        <div className="pt-4 border-t">
          <Button 
            onClick={() => onViewFullPage(news.id)}
            className="w-full sm:w-auto"
            variant="default"
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
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DrawerClose>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}