import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

type CardConfig = {
  key: string;
  label: string;
  icon: React.ElementType;
  color: string;
};

type Props = {
  cardsConfig?: CardConfig[];
  counts?: Record<string, number>;
  loading: boolean;
};

const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-2">
    <div className="flex gap-2 mb-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-3 h-3 bg-slate-300 rounded-full" />
      ))}
    </div>
    <div className="h-6 bg-slate-200 rounded" />
    <div className="h-4 bg-slate-100 rounded" />
  </div>
);

export default function StatsCards({
  cardsConfig = [],
  counts = {},
  loading,
}: Props) {
  if (!cardsConfig.length) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No stats to display
      </div>
    );
  }

  const getGrowthData = (key: string) => ({
    value: Math.abs(growthRates[key] ?? 0).toFixed(1),
    isPositive: (growthRates[key] ?? 0) >= 0,
  });

  const growthRates: Record<string, number> = {
    fees: 12.5,
    students: 8.3,
    blogs: -2.1,
    news: 15.7,
    gallery: 5.4,
    events: 22.8,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="overflow-x-auto pb-2"
    >
      <div className="flex gap-4 min-w-full sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6 sm:gap-4">
        {cardsConfig.map(({ key, label, icon: Icon, color }) => {
          const { value, isPositive } = getGrowthData(key);
          const IconComponent = isPositive ? TrendingUp : TrendingDown;
          const count = counts[key] ?? 0;

          const trendColor = isPositive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-red-500 dark:text-red-400';
          const trendBg = isPositive
            ? 'bg-emerald-50 dark:bg-emerald-900/20'
            : 'bg-red-50 dark:bg-red-900/20';
          const trendBorder = isPositive
            ? 'border-emerald-200 dark:border-emerald-800'
            : 'border-red-200 dark:border-red-800';

          return (
            <motion.div
              key={key}
              variants={cardVariants}
              className="min-w-[220px] sm:min-w-0 group relative bg-card/90 dark:bg-card/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-border hover:scale-[1.02] hover:-translate-y-1"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.02] group-hover:opacity-[0.08] transition-opacity`}
              />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-slate-200/30 dark:group-hover:border-slate-600/30 rounded-xl pointer-events-none" />

              <div className="relative p-4 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${trendBg} ${trendColor} ${trendBorder}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{value}%</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-end">
                  {loading ? (
                    <LoadingSkeleton />
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-foreground">
                          {count.toLocaleString()}
                        </span>
                        <Activity className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground line-clamp-2">
                        {label}
                      </span>
                    </>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                  <div
                    className={`h-full bg-gradient-to-r ${color} opacity-60 group-hover:opacity-100 transition-opacity`}
                    style={{ width: `${Math.min((count / 100) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
