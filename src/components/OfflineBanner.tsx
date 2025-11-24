import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineBanner = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-yellow-600 text-white p-2 text-center text-sm flex items-center justify-center gap-2 z-[9999] animate-fade-in border-t border-white/10 shadow-lg shadow-black/20">
      <WifiOff size={16} />
      <span>You’re offline. The app requires an internet connection.</span>
    </div>
  );
};

export default OfflineBanner;
