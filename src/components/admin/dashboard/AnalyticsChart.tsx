
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type AnalyticsData = {
  name: string;
  count: number;
};

type Props = {
  analyticsData: AnalyticsData[];
};

export default function AnalyticsChart({ analyticsData }: Props) {
  return (
    <section className="rounded-2xl shadow bg-white/90 px-2 xs:px-4 sm:px-6 py-5 h-full">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-yellow-600">
        Analytics
      </h2>
      <div className="w-full h-[240px] xs:h-[300px] md:h-[380px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analyticsData}>
            <CartesianGrid strokeDasharray="3 3" className="text-gray-100" />
            <XAxis
              dataKey="name"
              tick={{ fontWeight: 600, fontSize: 10, fill: "#a16207" }} // yellow-700
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontWeight: 600, fontSize: 11, fill: "#78716c" }}
              axisLine={false}
              width={30}
            />
            <Tooltip
              cursor={{ fill: "rgba(251, 191, 36, 0.13)" }}
              contentStyle={{
                borderRadius: "0.5rem",
                borderColor: "#fde68a",
                backgroundColor: "#fff",
                fontWeight: 600,
              }}
              labelStyle={{
                color: "#ca8a04", // yellow-600
                fontWeight: 700,
              }}
            />
            <Bar dataKey="count" fill="#FACC15" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
