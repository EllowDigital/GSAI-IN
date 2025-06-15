
import React from "react";
import FastStats from "./FastStats";
import AdvancedStats from "./AdvancedStats";
import { LayoutDashboard } from "lucide-react";

export default function StatsHome() {
  return (
    <div className="w-full max-w-6xl mx-auto font-montserrat">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-2">
        <LayoutDashboard className="w-8 h-8 text-yellow-400" />
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-yellow-400 font-montserrat drop-shadow-sm">
          Dashboard Overview
        </h2>
      </div>
      {/* FastStats Section */}
      <div className="mb-6">
        <FastStats />
      </div>
      {/* AdvancedStats Section */}
      <div className="mb-8">
        <AdvancedStats />
      </div>
    </div>
  );
}
