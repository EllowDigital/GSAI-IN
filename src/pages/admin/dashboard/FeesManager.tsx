import React, { useEffect, useMemo, useState } from 'react';
import FeesManagerPanel from '@/components/admin/FeesManagerPanel';
import FeeSettingsCard from '@/components/admin/FeeSettingsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, DollarSign, Settings } from 'lucide-react';

export default function FeesManager() {
  const [activeTab, setActiveTab] = useState<'records' | 'stats' | 'settings'>(
    'records'
  );
  const [statsVisited, setStatsVisited] = useState(false);

  useEffect(() => {
    if (activeTab === 'stats' && !statsVisited) {
      setStatsVisited(true);
    }
  }, [activeTab, statsVisited]);

  const headingMeta = useMemo(() => {
    if (activeTab === 'stats') {
      return {
        title: 'Fees Stats',
        subtitle: 'Track paid, pending, due, and monthly trends.',
      };
    }

    if (activeTab === 'settings') {
      return {
        title: 'Fees Settings',
        subtitle: 'Configure monthly fees by program in one place.',
      };
    }

    return {
      title: 'Fees Records',
      subtitle: 'Manage student fees, payments, and pending dues.',
    };
  }, [activeTab]);

  return (
    <div className="admin-page">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as 'records' | 'stats' | 'settings')
        }
        className="w-full space-y-3"
      >
        <section className="admin-panel overflow-hidden">
          <div className="admin-panel-body bg-gradient-to-r from-primary/5 via-background to-background py-3 sm:py-4">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-9 sm:w-9">
                  <DollarSign className="h-4 w-4" />
                </span>
                <div>
                  <h1 className="text-lg font-bold text-foreground sm:text-xl">
                    {headingMeta.title}
                  </h1>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {headingMeta.subtitle}
                  </p>
                </div>
              </div>

              <TabsList className="grid h-9 w-full grid-cols-3 rounded-xl border border-border/70 bg-card p-1 sm:h-10 sm:w-[360px]">
                <TabsTrigger
                  value="records"
                  className="gap-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <DollarSign className="h-3.5 w-3.5" /> Records
                </TabsTrigger>
                <TabsTrigger
                  value="stats"
                  className="gap-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <BarChart3 className="h-3.5 w-3.5" /> Stats
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="gap-1.5 rounded-lg text-xs sm:text-sm"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </section>

        <TabsContent value="records">
          <FeesManagerPanel section="records" />
        </TabsContent>

        <TabsContent value="stats">
          <FeesManagerPanel section="stats" enableAnalytics={statsVisited} />
        </TabsContent>

        <TabsContent value="settings">
          <section className="admin-panel">
            <div className="admin-panel-body">
              <FeeSettingsCard />
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
