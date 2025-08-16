import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className
}: AdminPageHeaderProps) {
  return (
    <div className={cn(
      'glass-header rounded-t-2xl',
      className
    )}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-heading-xl text-foreground font-bold">
                {title}
              </h1>
              {description && (
                <p className="text-body-md text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="flex flex-wrap gap-3 sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}