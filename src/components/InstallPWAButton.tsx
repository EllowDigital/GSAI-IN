
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
      className="fixed bottom-16 sm:bottom-5 right-5 z-[9998] bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg rounded-full h-14 w-14 p-0 animate-fade-in"
      aria-label="Install App"
      title="Install App"
    >
      <Download size={24} />
    </Button>
  );
};

export default InstallPWAButton;
