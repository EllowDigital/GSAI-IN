
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

type AnalyticsData = {
  name: string;
  count: number;
};

type Props = {
  analyticsData: AnalyticsData[];
};

const chartColors = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#8B5CF6', // violet-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#06B6D4', // cyan-500
];

export default function AnalyticsChart({ analyticsData }: Props) {
  return (
    <div className="w-full h-[300px] md:h-[400px] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E2E8F0" 
            opacity={0.5}
          />
          <XAxis
            dataKey="name"
            tick={{ 
              fontWeight: 600, 
              fontSize: 11, 
              fill: '#475569' // slate-600
            }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            allowDecimals={false}
            tick={{ 
              fontWeight: 600, 
              fontSize: 12, 
              fill: '#64748B' // slate-500
            }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            cursor={{ 
              fill: 'rgba(59, 130, 246, 0.1)', 
              radius: 8 
            }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{
              color: '#1E40AF', // blue-800
              fontWeight: 700,
              marginBottom: '4px'
            }}
            formatter={(value: number) => [
              value.toLocaleString(), 
              'Count'
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          >
            {analyticsData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
