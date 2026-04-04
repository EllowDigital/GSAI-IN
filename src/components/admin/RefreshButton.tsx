import React from 'react';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  isLoading?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isLoading = false,
  className = '',
  size = 'default',
  variant = 'outline',
  showText = true,
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [refreshStatus, setRefreshStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshStatus('idle');

    try {
      await onRefresh();
      setRefreshStatus('success');

      // Reset success status after animation
      setTimeout(() => {
        setRefreshStatus('idle');
      }, 2000);
    } catch (error) {
      setRefreshStatus('error');

      // Reset error status after animation
      setTimeout(() => {
        setRefreshStatus('idle');
      }, 3000);
    } finally {
      // Minimum animation duration for better UX
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  const loading = isLoading || isRefreshing;

  const getStatusIcon = () => {
    if (refreshStatus === 'success') return <CheckCircle className="w-4 h-4" />;
    if (refreshStatus === 'error') return <AlertCircle className="w-4 h-4" />;
    return (
      <RefreshCw
        className={`w-4 h-4 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`}
      />
    );
  };

  const getStatusColor = () => {
    if (refreshStatus === 'success')
      return 'border-green-200/70 bg-green-50/80 text-green-700 hover:bg-green-100/80';
    if (refreshStatus === 'error')
      return 'border-red-200/70 bg-red-50/80 text-red-700 hover:bg-red-100/80';
    return 'border-border/70 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground';
  };

  const getStatusText = () => {
    if (refreshStatus === 'success') return 'Refreshed!';
    if (refreshStatus === 'error') return 'Failed';
    if (loading) return 'Refreshing...';
    return 'Refresh';
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      variant={variant}
      size={size}
      className={`
        group relative overflow-hidden rounded-lg
        ${getStatusColor()}
        transition-all duration-200
        ${loading ? 'cursor-not-allowed opacity-75' : ''}
        ${refreshStatus !== 'idle' ? 'animate-pulse' : ''}
        ${className}
      `}
      aria-label={loading ? 'Refreshing...' : 'Refresh data'}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 opacity-0"
        animate={{
          opacity: loading ? [0, 0.3, 0] : 0,
        }}
        transition={{
          duration: 1.5,
          repeat: loading ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={refreshStatus}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {getStatusIcon()}
          </motion.div>
        </AnimatePresence>

        {showText && (
          <AnimatePresence mode="wait">
            <motion.span
              key={getStatusText()}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden text-sm font-medium sm:inline"
            >
              {getStatusText()}
            </motion.span>
          </AnimatePresence>
        )}
      </div>

      {/* Ripple Effect */}
      {refreshStatus === 'success' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-green-200"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {refreshStatus === 'error' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-red-200"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </Button>
  );
};

export default RefreshButton;
