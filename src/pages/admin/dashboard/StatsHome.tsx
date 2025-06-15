
import React from "react";
import FastStats from "./FastStats";
import AdvancedStats from "./AdvancedStats";
import { LayoutDashboard } from "lucide-react";
import { BadgeDollarSign } from "lucide-react";

export default function StatsHome() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-4 px-2">
        <LayoutDashboard className="w-8 h-8 text-yellow-400" />
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-yellow-400 font-montserrat">
          Dashboard
        </h2>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 mb-6">
        <FastStats />
      </div>
      <div className="w-full mb-6">
        <AdvancedStats />
      </div>
      <div className="mt-6 flex flex-wrap gap-4 justify-end">
        <a
          href="/admin/dashboard/fees"
          className="inline-flex items-center gap-2 border border-yellow-400 px-5 py-2.5 rounded-full bg-yellow-50 text-yellow-700 font-semibold hover:bg-yellow-200 hover:shadow transition transition-all duration-200 text-base shadow-sm"
        >
          <BadgeDollarSign className="w-5 h-5" />
          Fees Manager
        </a>
      </div>
    </div>
  );
}
