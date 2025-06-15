
import React from "react";
import FastStats from "./FastStats";
import AdvancedStats from "./AdvancedStats";
import { LayoutDashboard, UserCircle2, Bell, Settings } from "lucide-react";

export default function StatsHome() {
  // For demo, fake admin data; ideally pulled from user/provider
  const admin = {
    name: "Admin",
    avatar: "/favicon.ico",
    role: "Super Admin"
  };

  return (
    <div className="w-full max-w-6xl mx-auto font-montserrat">
      {/* Dashboard header */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mb-10 px-2 py-6 rounded-2xl bg-gradient-to-r from-yellow-50 via-white to-yellow-100 shadow border border-yellow-100 relative overflow-hidden animate-fade-in">
        <div className="flex items-center gap-4">
          <span className="hidden xs:inline-flex items-center justify-center bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full p-2 shadow">
            <LayoutDashboard className="w-9 h-9 text-yellow-700" />
          </span>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-500 font-montserrat drop-shadow-md flex items-center gap-2">
              Dashboard
            </h2>
            <span className="inline-block mt-0.5 text-xs xs:text-sm text-gray-500 font-semibold bg-yellow-100 px-3 py-1 rounded-full shadow-sm">
              Welcome, {admin.name}!
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <img
              src={admin.avatar}
              alt="Admin Avatar"
              className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-yellow-300 shadow-lg bg-white object-cover mb-1"
            />
            <span className="text-xs font-medium text-gray-500 rounded-md px-2 py-0.5 bg-white/60 border border-yellow-50">{admin.role}</span>
          </div>
          {/* Optional: notification/settings icons */}
          <button className="ml-2 rounded-full p-2 bg-yellow-50 hover:bg-yellow-200 transition shadow" title="Notifications" type="button">
            <Bell className="w-5 h-5 text-yellow-500" />
          </button>
          <button className="rounded-full p-2 bg-yellow-50 hover:bg-yellow-200 transition shadow" title="Settings" type="button">
            <Settings className="w-5 h-5 text-yellow-500" />
          </button>
        </div>
      </div>

      {/* FastStats - key summary row */}
      <div className="mb-6 animate-fade-in">
        <FastStats />
      </div>
      {/* AdvancedStats Section */}
      <div className="mb-10 animate-fade-in">
        <AdvancedStats />
      </div>
    </div>
  );
}
