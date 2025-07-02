import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackCardProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function BackCard({
  title,
  subtitle,
  onBack,
  onRefresh,
  isRefreshing = false,
  className,
  children,
}: BackCardProps) {
  return (
    <Card
      className={cn(
        'bg-gradient-to-r from-primary/5 to-secondary/5 border-border/60',
        className
      )}
    >
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="flex-shrink-0 p-2 sm:p-2.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <span className="truncate">{title}</span>
            </CardTitle>
            {subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex-shrink-0 gap-2"
            >
              <RotateCcw
                className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}
        </div>
      </CardHeader>

      {children && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  );
}
