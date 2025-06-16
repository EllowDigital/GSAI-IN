import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface InstallPWAButtonProps {
  onInstall: () => void;
}

const InstallPWAButton: React.FC<InstallPWAButtonProps> = ({ onInstall }) => {
  return (
    <Button
      onClick={onInstall}
      className="fixed bottom-[clamp(1rem,4vw,2.5rem)] right-[clamp(1rem,4vw,2.5rem)] z-[9998] h-16 w-16 sm:h-14 sm:w-14 rounded-full p-0 shadow-xl bg-yellow-400 hover:bg-yellow-500 text-white transition-all duration-300 ease-in-out animate-fade-scale focus:outline-none focus:ring-4 focus:ring-yellow-300"
      aria-label="Install App"
      title="Install App"
    >
      <Download size={28} />
      {/* optional text for screen readers */}
      <span className="sr-only">Install GSAI App</span>
    </Button>
  );
};

export default InstallPWAButton;
