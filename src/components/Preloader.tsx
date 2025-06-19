
import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50">
      <div className="text-center">
        <div className="relative mb-8">
          <img
            src="/assets/img/logo.webp"
            alt="Ghatak Sports Academy India"
            className="w-20 h-20 mx-auto rounded-full border-4 border-yellow-400 shadow-lg animate-pulse"
          />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin"></div>
        </div>
        
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Loader2 size={24} className="animate-spin text-yellow-600" />
          <span className="text-xl font-bold text-gray-800">Loading...</span>
        </div>
        
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full animate-pulse"></div>
        </div>
        
        <p className="text-sm text-gray-600 mt-4 font-medium">
          Ghatak Sports Academy India
        </p>
      </div>
    </div>
  );
}
