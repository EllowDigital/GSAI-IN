
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export default function RefreshButton({ 
  onRefresh, 
  isLoading = false, 
  className,
  size = 'sm'
}: RefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size={size}
      onClick={onRefresh}
      disabled={isLoading}
      className={cn(
        "gap-2 rounded-full border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors",
        className
      )}
    >
      <RefreshCw className={cn(
        "w-4 h-4",
        isLoading && "animate-spin"
      )} />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );
}
