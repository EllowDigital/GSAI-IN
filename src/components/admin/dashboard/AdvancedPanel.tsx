
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldCheck, Database, Server, UserPlus, FilePlus, CalendarPlus } from 'lucide-react';

const statusItems = [
  { label: 'API Services', status: 'Operational', icon: Server, color: 'text-green-500' },
  { label: 'Database', status: 'Connected', icon: Database, color: 'text-green-500' },
  { label: 'Authentication', status: 'Secure', icon: ShieldCheck, color: 'text-green-500' },
];

const quickActions = [
  { label: 'Add Student', icon: UserPlus, path: '/admin/dashboard/students' },
  { label: 'New Blog Post', icon: FilePlus, path: '/admin/dashboard/blogs' },
  { label: 'Schedule Event', icon: CalendarPlus, path: '/admin/dashboard/events' },
];

export default function AdvancedPanel() {
  return (
    <section className="rounded-2xl shadow bg-white/90 p-4 sm:p-6 h-full flex flex-col">
      <div>
        <h3 className="text-lg font-bold text-yellow-700 mb-4">System Status</h3>
        <ul className="space-y-3">
          {statusItems.map(item => (
            <li key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                <span className={`font-semibold ${item.color}`}>{item.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-gray-200 my-6"></div>
      <div>
        <h3 className="text-lg font-bold text-yellow-700 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map(action => (
            <NavLink
              key={action.label}
              to={action.path}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-yellow-100/60 border border-gray-200 hover:border-yellow-200 transition-all duration-200 group"
            >
              <action.icon className="w-6 h-6 text-gray-500 group-hover:text-yellow-600 transition-colors" />
              <span className="font-semibold text-gray-700 group-hover:text-yellow-800 transition-colors">{action.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
}
