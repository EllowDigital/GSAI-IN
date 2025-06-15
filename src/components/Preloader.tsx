
import React from "react";
import Spinner from "./ui/spinner";

export default function Preloader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white animate-fade-in"
      aria-label="Loading site content"
      role="status"
    >
      <Spinner size={48} />
      <h1 className="mt-6 font-montserrat font-semibold text-2xl text-gray-800 text-center tracking-wide">
        Ghatak Sports Academy India
      </h1>
      <p className="text-gray-500 font-medium text-lg mt-2">
        Empowering Champions...
      </p>

      {/* CSS for custom animation */}
      <style>
        {`
          .animate-fade-in {
            animation: fade-in 0.8s ease;
          }
          @keyframes fade-in {
            0% { opacity: 0;}
            100% { opacity: 1;}
          }
        `}
      </style>
    </div>
  );
}
