import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface PWAInstallToastProps {
  onInstall: () => void;
  onDismiss: () => void;
}

const PWAInstallToast: React.FC<PWAInstallToastProps> = ({
  onInstall,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[9998] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-background/95 p-4 shadow-lg shadow-primary/10 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl flex-shrink-0">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm">
              Install GSAI App
            </h3>
            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
              Get quick access from your home screen with offline support
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install reminder"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onDismiss}
            className="flex-1 h-9 text-xs"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={onInstall}
            className="flex-1 h-9 text-xs bg-primary hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Install
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallToast;
