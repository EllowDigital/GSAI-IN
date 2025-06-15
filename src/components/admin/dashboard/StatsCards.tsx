
import React from 'react';

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
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
      {cardsConfig.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className={`bg-gradient-to-br ${color} flex flex-col items-center justify-center rounded-2xl shadow-md p-4 sm:p-5 min-h-[120px] w-full border transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
        >
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 mb-2" />
          <span className="text-xl sm:text-2xl font-extrabold">
            {loading ? <span className="animate-pulse">...</span> : counts?.[key] ?? 0}
          </span>
          <span className="text-xs sm:text-sm font-bold opacity-80 text-center">{label}</span>
        </div>
      ))}
    </div>
  );
}
