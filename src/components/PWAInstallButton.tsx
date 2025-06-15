
import React from "react";
import { Download } from "lucide-react";

const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check for already installed state
    if ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        // @ts-ignore
        window.navigator.standalone === true) {
      setVisible(false);
    }

    // Hide if already installed
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", () => setVisible(false));
    };
  }, []);

  const onClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
    }
  };

  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 shadow transition duration-150 text-sm"
      aria-label="Install App"
    >
      <Download className="w-5 h-5" /> Install App
    </button>
  );
};

export default PWAInstallButton;
