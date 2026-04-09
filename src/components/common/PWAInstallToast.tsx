import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud, X, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAInstallToastProps {
  onInstall: () => void;
  onDismiss: () => void;
  portalType?: 'admin' | 'student';
  onEnableNotifications?: () => void;
  pushReady?: boolean;
}

const PWAInstallToast: React.FC<PWAInstallToastProps> = ({
  onInstall,
  onDismiss,
  portalType = 'admin',
  onEnableNotifications,
  pushReady = false,
}) => {
  const isStudent = portalType === 'student';

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-[9999] animate-in slide-in-from-bottom-8 fade-in duration-500 ease-out">
      <div
        className={cn(
          'relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-xl',
          'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-orange-500/5 after:to-transparent after:pointer-events-none'
        )}
      >
        {/* Animated Accent line at the top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

        <div className="flex flex-col gap-5 relative z-10">
          {/* Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 shadow-inner border border-orange-500/20">
                <Zap className="h-6 w-6 fill-orange-500/20" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    Elite Access
                  </span>
                  <Sparkles className="h-3 w-3 text-orange-400" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">
                  {isStudent ? 'Student Portal App' : 'Admin Portal App'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss invitation"
              className="rounded-full p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs font-medium leading-relaxed text-slate-400 px-1">
            Install the {isStudent ? 'student' : 'admin'} portal for{' '}
            <span className="text-slate-200">lightning-fast access</span>,
            offline support, and instant updates.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="flex-1 h-11 rounded-xl text-xs font-bold text-slate-400 hover:bg-white/5 hover:text-white transition-all"
            >
              Maybe Later
            </Button>
            <Button
              size="sm"
              onClick={onInstall}
              className={cn(
                'flex-1 h-11 rounded-xl text-xs font-black uppercase tracking-wider',
                'bg-orange-600 text-white shadow-lg shadow-orange-900/20 hover:bg-orange-500 hover:-translate-y-0.5 active:scale-95 transition-all'
              )}
            >
              <DownloadCloud className="mr-2 h-4 w-4 stroke-[2.5]" />
              Get App
            </Button>
          </div>

          {pushReady && onEnableNotifications && (
            <Button
              size="sm"
              variant="outline"
              onClick={onEnableNotifications}
              className="h-10 rounded-xl border-white/20 bg-white/5 text-xs font-bold text-white hover:bg-white/10"
            >
              🔔 Enable Notifications
            </Button>
          )}
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-orange-600/10 blur-[50px] pointer-events-none" />
      </div>
    </div>
  );
};

export default PWAInstallToast;
