
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Hide button if app is already installed or running standalone
    if (
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      // @ts-ignore
      window.navigator.standalone === true
    ) {
      setShowButton(false);
    }

    // Hide button on install complete
    const onAppInstalled = () => setShowButton(false);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        console.log("User accepted the install prompt");
      }
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  if (!showButton) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Button
        onClick={handleInstall}
        variant="default"
        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl"
      >
        <Download className="w-5 h-5 mr-2" />
        Install App
      </Button>
    </div>
  );
}
