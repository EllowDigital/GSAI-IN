import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PWAInstallToastProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallToast: React.FC<PWAInstallToastProps> = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-[9998] px-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-lg border border-yellow-300 bg-white/95 p-4 shadow-lg shadow-yellow-500/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm sm:text-base text-gray-900">
          <Download className="text-yellow-500" size={20} />
          <div className="flex flex-col">
            <span className="font-semibold">Install the GSAI Admin Panel</span>
            <span className="text-gray-600 text-xs sm:text-sm">
              Add the dashboard to your home screen for faster access.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onInstall} className="bg-yellow-500 hover:bg-yellow-600 text-white">
            Install App
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install reminder"
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallToast;
