import React from 'react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';
import FeeSettingsCard from '@/components/admin/FeeSettingsCard';
import { DollarSign } from 'lucide-react';

export default function FeesManager() {
  return (
    <div className="admin-page">
      <section className="admin-panel overflow-hidden">
        <div className="admin-panel-body bg-gradient-to-r from-primary/5 via-background to-background">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <DollarSign className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Fees Workspace
              </h1>
              <p className="text-sm text-muted-foreground">
                Track collections, manage dues, and run monthly fee operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-body">
          <FeeSettingsCard />
        </div>
      </section>

      <FeesManagerPanel />
    </div>
  );
}
