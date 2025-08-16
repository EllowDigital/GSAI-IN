import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminCard, AdminCardContent } from './AdminCard';

interface StatItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

interface AdminStatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success-muted text-success border-success/20',
  warning: 'bg-warning-muted text-warning border-warning/20',
  error: 'bg-error-muted text-error border-error/20',
  info: 'bg-info-muted text-info border-info/20'
};

const gridColsClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
};

export function AdminStatsGrid({ 
  stats, 
  columns = 4, 
  className 
}: AdminStatsGridProps) {
  return (
    <div className={cn(
      'grid gap-4 sm:gap-6',
      gridColsClasses[columns],
      className
    )}>
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        
        return (
          <AdminCard key={index} interactive className="hover:scale-105">
            <AdminCardContent padding="lg">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-body-sm text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-heading-lg font-bold text-foreground">
                    {typeof stat.value === 'number' 
                      ? stat.value.toLocaleString() 
                      : stat.value
                    }
                  </p>
                  {stat.trend && (
                    <div className={cn(
                      'flex items-center gap-1 text-xs font-medium',
                      stat.trendUp ? 'text-success' : 'text-error'
                    )}>
                      <span>{stat.trend}</span>
                    </div>
                  )}
                </div>
                
                {IconComponent && (
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl border',
                    stat.color ? colorClasses[stat.color] : colorClasses.primary
                  )}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                )}
              </div>
            </AdminCardContent>
          </AdminCard>
        );
      })}
    </div>
  );
}