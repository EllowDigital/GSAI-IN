
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

export default function StatsCards({ cardsConfig, counts, loading }: Props) {
  // Simulate growth data for demonstration
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
      color: isPositive ? 'text-green-600' : 'text-red-500',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
    };
  };

  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
      {cardsConfig.map(({ key, label, icon: Icon, color }) => {
        const growth = getGrowthData(key);
        const growthData = formatGrowth(growth);
        const count = counts?.[key] ?? 0;

        return (
          <div
            key={key}
            className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-200/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden`}
          >
            {/* Background Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            
            {/* Content */}
            <div className="relative p-6 flex flex-col h-full min-h-[140px]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                {/* Growth Indicator */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${growthData.bgColor} ${growthData.color}`}>
                  <growthData.icon className="w-3 h-3" />
                  <span>{growthData.value}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 flex flex-col justify-end">
                <div className="mb-2">
                  <span className="text-2xl lg:text-3xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    ) : (
                      count.toLocaleString()
                    )}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors duration-300 leading-tight">
                  {label}
                </span>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-slate-200/30 transition-colors duration-300 pointer-events-none" />
            </div>

            {/* Subtle Animation Element */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        );
      })}
    </div>
  );
}
