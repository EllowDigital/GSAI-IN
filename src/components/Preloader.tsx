
import React from "react";
import { Sparkles } from "lucide-react";

export default function Preloader() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-red-50 animate-fade-in"
      aria-label="Loading site content"
      role="status"
    >
      {/* Logo Spinner */}
      <div className="relative mb-4">
        <img
          src="/assets/img/logo.webp"
          alt="Ghatak Sports Academy India Logo"
          className="w-20 h-20 xs:w-28 xs:h-28 rounded-full drop-shadow-lg animate-spin-slow border-4 border-yellow-300"
          style={{ animation: "spin 1.7s linear infinite" }}
          draggable={false}
        />
        <Sparkles className="absolute -top-3 -right-4 text-yellow-400 w-9 h-9 drop-shadow animate-pulse" />
      </div>
      {/* Main text */}
      <h1 className="font-montserrat font-black text-2xl xs:text-3xl text-yellow-500 uppercase text-center tracking-wide drop-shadow">
        Welcome to
        <br />
        <span className="text-red-500 text-3xl xs:text-4xl font-extrabold tracking-tight animate-fade-in">
          Ghatak Sports Academy India™
        </span>
      </h1>
      <p className="text-gray-500 font-medium text-lg xs:text-xl mt-2 animate-fade-in">Empowering Champions...</p>

      {/* CSS for custom spin */}
      <style>
        {`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin 1.7s linear infinite;
          }
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
