
import React from "react";
import FastStats from "./FastStats";
import AdvancedStats from "./AdvancedStats";
import { LayoutDashboard } from "lucide-react";
import { BadgeDollarSign } from "lucide-react";

export default function StatsHome() {
  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-4 flex items-center gap-3 text-yellow-400">
        <LayoutDashboard className="w-8 h-8" />
        Dashboard
      </h2>
      <FastStats />
      <AdvancedStats />
      <div className="mt-4">
        <a
          href="/admin/dashboard/fees"
          className="inline-flex items-center gap-2 border border-yellow-400 px-4 py-2 rounded-full bg-yellow-50 text-yellow-700 font-semibold hover:bg-yellow-200 transition"
        >
          <BadgeDollarSign className="w-5 h-5" />
          Fees Manager
        </a>
      </div>
    </div>
  );
}
