import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface PWAInstallToastProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallToast: React.FC<PWAInstallToastProps> = ({
  onInstall,
  onDismiss,
}) => {
  return (
    <div className="fixed top-4 left-0 right-0 z-[9998] px-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 rounded-xl border border-yellow-500/20 bg-[#0a0a0a]/95 p-4 shadow-lg shadow-yellow-500/10 backdrop-blur-md">
        <div className="flex items-center gap-3 text-sm sm:text-base text-white">
          <div className="p-2 bg-yellow-500/10 rounded-full">
            <Download className="text-yellow-500" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white">Install the GSAI App</span>
            <span className="text-gray-400 text-xs sm:text-sm">
              Add to home screen for faster access and offline mode.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={onInstall}
            className="bg-gradient-to-r from-yellow-500 to-red-600 hover:from-yellow-600 hover:to-red-700 text-white border-0 shadow-md shadow-orange-500/20"
          >
            Install App
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install reminder"
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallToast;
