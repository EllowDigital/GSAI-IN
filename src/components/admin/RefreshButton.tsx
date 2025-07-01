
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
  const [refreshStatus, setRefreshStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

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
    return <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />;
  };

  const getStatusColor = () => {
    if (refreshStatus === 'success') return 'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200/60 hover:border-green-300/80 text-green-700 hover:text-green-800';
    if (refreshStatus === 'error') return 'from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200/60 hover:border-red-300/80 text-red-700 hover:text-red-800';
    return 'from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200/60 hover:border-blue-300/80 text-blue-700 hover:text-blue-800';
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
        group relative overflow-hidden
        bg-gradient-to-r ${getStatusColor()}
        shadow-sm hover:shadow-md
        transition-all duration-300
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
          ease: "easeInOut"
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
              className="font-medium text-sm"
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
