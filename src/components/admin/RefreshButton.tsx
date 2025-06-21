import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  className = '',
  size = 'default',
  variant = 'outline',
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Minimum animation duration
    }
  };

  const loading = isLoading || isRefreshing;

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      variant={variant}
      size={size}
      className={`
        group relative overflow-hidden
        bg-gradient-to-r from-blue-50 to-indigo-50 
        hover:from-blue-100 hover:to-indigo-100
        border-blue-200/60 hover:border-blue-300/80
        text-blue-700 hover:text-blue-800
        shadow-sm hover:shadow-md
        transition-all duration-300
        ${loading ? 'cursor-not-allowed opacity-75' : ''}
        ${className}
      `}
      aria-label={loading ? 'Refreshing...' : 'Refresh data'}
    >
      {/* Background Animation */}
      <div
        className={`
        absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        ${loading ? 'animate-pulse' : ''}
      `}
      />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        <RefreshCw
          className={`
            w-4 h-4 transition-all duration-500
            ${loading ? 'animate-spin text-blue-600' : 'group-hover:rotate-180'}
          `}
        />
        <span className="font-medium text-sm">
          {loading ? 'Refreshing...' : 'Refresh'}
        </span>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
        </div>
      )}
    </Button>
  );
};

export default RefreshButton;
