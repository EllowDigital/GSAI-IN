import React from 'react';
import Spinner from './ui/spinner';

export default function Preloader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-white via-gray-100 to-gray-200 animate-fade-scale"
      aria-label="Loading site content"
      role="status"
    >
      <Spinner size={60} className="animate-spin-slow text-red-600" />

      <h1 className="mt-6 font-montserrat font-bold text-3xl text-gray-800 text-center tracking-wide animate-text-pop">
        Ghatak Sports Academy India
      </h1>

      <p className="text-gray-600 font-medium text-lg mt-2 animate-fade-in-slow">
        Empowering Champions...
      </p>

      {/* Custom CSS Animations */}
      <style>
        {`
          .animate-fade-scale {
            animation: fade-scale 0.8s ease-in-out both;
          }

          .animate-spin-slow {
            animation: spin 2s linear infinite;
          }

          .animate-text-pop {
            animation: text-pop 0.6s ease-in-out both;
          }

          .animate-fade-in-slow {
            animation: fade-in 1.2s ease-in-out both;
          }

          @keyframes fade-scale {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes text-pop {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
