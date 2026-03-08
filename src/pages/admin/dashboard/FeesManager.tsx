import React from 'react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';
import FeeSettingsCard from '@/components/admin/FeeSettingsCard';

export default function FeesManager() {
  return (
    <div className="h-full space-y-4">
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 pt-3 sm:pt-4 lg:pt-6 max-w-[1600px] mx-auto">
        <FeeSettingsCard />
      </div>
      <FeesManagerPanel />
    </div>
  );
}
