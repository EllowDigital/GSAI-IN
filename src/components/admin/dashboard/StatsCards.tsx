
import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

type CardConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
  table: string;
};

type Props = {
  cardsConfig: CardConfig[];
  counts?: Record<string, number>;
  loading: boolean;
};

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
      <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
    </div>
    <div className="h-6 bg-slate-200 rounded mb-2"></div>
    <div className="h-4 bg-slate-100 rounded"></div>
  </div>
);

export default function StatsCards({ cardsConfig, counts, loading }: Props) {
  // Enhanced growth simulation with more realistic data
  const getGrowthData = (key: string) => {
    const growthRates: Record<string, number> = {
      fees: 12.5,
      students: 8.3,
      blogs: -2.1,
      news: 15.7,
      gallery: 5.4,
      events: 22.8,
    };
    return growthRates[key] || 0;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
      bgColor: isPositive ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      borderColor: isPositive ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800',
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cardsConfig.map(({ key, label, icon: Icon, color }, index) => {
        const growth = getGrowthData(key);
        const growthData = formatGrowth(growth);
        const count = counts?.[key] ?? 0;

        return (
          <motion.div
            key={key}
            variants={cardVariants}
            className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl dark:shadow-slate-900/20 border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden"
          >
            {/* Animated Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-500`}
            />

            {/* Subtle Border Animation */}
            <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-slate-200/30 dark:group-hover:border-slate-600/30 transition-colors duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-[140px] sm:min-h-[160px]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-110`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>

                {/* Enhanced Growth Indicator */}
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${growthData.bgColor} ${growthData.color} ${growthData.borderColor} shadow-sm`}
                >
                  <growthData.icon className="w-3 h-3" />
                  <span>{growthData.value}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="mb-2">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {count.toLocaleString()}
                        </span>
                        <Activity className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300" />
                      </div>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300 leading-tight">
                        {label}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Progress Bar */}
              <div className="absolute bottom-0 left-0 w-full h-1">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700">
                  <div 
                    className={`h-full bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                    style={{ width: `${Math.min(count / 100 * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
