import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="flex flex-col items-center space-y-6 text-center">
        {/* Logo – clean, no border/circle */}
        <div className="w-32 animate-pulse">
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Spinner and Label */}
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
          <span className="text-xl font-semibold text-gray-800">
            Loading...
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-56 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 animate-pulse rounded-full" />
        </div>

        {/* Footer Text */}
        <p className="text-sm text-gray-600 font-medium">
          Ghatak Sports Academy India
        </p>
      </div>
    </div>
  );
}
