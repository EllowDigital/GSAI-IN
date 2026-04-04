import React from 'react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';
import FeeSettingsCard from '@/components/admin/FeeSettingsCard';

export default function FeesManager() {
  return (
    <div className="admin-page">
      <FeeSettingsCard />
      <FeesManagerPanel />
    </div>
  );
}
