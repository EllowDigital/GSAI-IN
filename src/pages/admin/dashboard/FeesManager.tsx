
import React from 'react';
import { BadgeDollarSign } from 'lucide-react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';

export default function FeesManager() {
  return (
    <div className="w-full min-h-full p-2 sm:p-4 md:p-6">
      <div className="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-none sm:rounded-2xl shadow-sm sm:shadow-lg border-0 sm:border border-slate-200/60 dark:border-slate-700/60">
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-4 items-start xs:items-center justify-between p-3 sm:p-4 md:p-6 border-b border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <BadgeDollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-500" />
            <span>Fees Management</span>
          </h2>
        </div>
        <div className="p-3 sm:p-4 md:p-6">
          <FeesManagerPanel />
        </div>
      </div>
    </div>
  );
}
