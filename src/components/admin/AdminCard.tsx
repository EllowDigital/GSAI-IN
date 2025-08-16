import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  loading?: boolean;
}

interface AdminCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface AdminCardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8'
};

export function AdminCard({ 
  children, 
  className, 
  interactive = false,
  loading = false 
}: AdminCardProps) {
  return (
    <Card className={cn(
      'admin-card animate-fade-in',
      interactive && 'interactive-card cursor-pointer',
      loading && 'opacity-60 pointer-events-none',
      className
    )}>
      {children}
    </Card>
  );
}

export function AdminCardHeader({ children, className }: AdminCardHeaderProps) {
  return (
    <CardHeader className={cn('admin-card-header', className)}>
      {children}
    </CardHeader>
  );
}

export function AdminCardContent({ 
  children, 
  className, 
  padding = 'md' 
}: AdminCardContentProps) {
  return (
    <CardContent className={cn(
      paddingClasses[padding],
      className
    )}>
      {children}
    </CardContent>
  );
}