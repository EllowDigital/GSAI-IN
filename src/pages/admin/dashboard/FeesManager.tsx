import React from 'react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';
import FeeSettingsCard from '@/components/admin/FeeSettingsCard';

export default function FeesManager() {
  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <FeeSettingsCard />
      <FeesManagerPanel />
    </div>
  );
}
