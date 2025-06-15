
import React from "react";
import FastStats from "./FastStats";
import AdvancedStats from "./AdvancedStats";
import { LayoutDashboard } from "lucide-react";

export default function StatsHome() {
  const admin = {
    name: "Admin",
    avatar: "/favicon.ico",
    role: "Super Admin"
  };

  return (
    <div className="w-full max-w-7xl mx-auto font-montserrat px-1 xs:px-2 sm:px-3 md:px-6 xl:px-0 py-2 sm:py-6 animate-fade-in">
      {/* Dashboard header */}
      <div
        className="
          flex flex-col sm:flex-row items-center justify-between gap-4
          mb-7 px-2 md:px-6 py-6 rounded-2xl
          bg-gradient-to-br from-yellow-50 via-white to-yellow-100 shadow border border-yellow-100
          relative overflow-hidden
        "
      >
        <div className="flex items-center gap-3 md:gap-5 w-full sm:w-auto">
          <span className="inline-flex items-center justify-center bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-full p-2 shadow">
            <LayoutDashboard className="w-8 h-8 md:w-10 md:h-10 text-yellow-700" />
          </span>
          <div>
            <h2 className="text-2xl xs:text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-500 drop-shadow-md flex items-center gap-2">
              Dashboard
            </h2>
            <span className="inline-block mt-1 text-xs xs:text-sm text-gray-600 font-semibold bg-yellow-100 px-3 py-1 rounded-full shadow-sm">
              Welcome, {admin.name}!
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex flex-col items-center">
            <img
              src={admin.avatar}
              alt="Admin Avatar"
              className="w-11 h-11 md:w-14 md:h-14 rounded-full border-2 border-yellow-300 shadow-lg bg-white object-cover mb-1"
            />
            <span className="text-xs font-medium text-gray-500 rounded-md px-2 py-0.5 bg-white/60 border border-yellow-50">{admin.role}</span>
          </div>
        </div>
      </div>
      {/* Stats sections */}
      <div className="mb-6">
        <FastStats />
      </div>
      <div className="mb-10">
        <AdvancedStats />
      </div>
    </div>
  );
}

