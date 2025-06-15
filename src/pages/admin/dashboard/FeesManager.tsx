import React from 'react';
import { BadgeDollarSign } from 'lucide-react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';

export default function FeesManager() {
  return (
    <div className="max-w-7xl mx-auto p-4 bg-white rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
          <BadgeDollarSign className="w-7 h-7" /> Fees Management
        </h2>
      </div>
      <FeesManagerPanel />
    </div>
  );
}
