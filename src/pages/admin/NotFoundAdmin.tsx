import React, { useEffect } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundAdmin() {
  
  // --- Dynamic Page Title ---
  useEffect(() => {
    document.title = 'Page Not Found | GSAI Admin';
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4 font-sans selection:bg-amber-500/20">
      <div className="text-center max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Icon Container with Pulse Effect */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <div className="relative p-5 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 shadow-sm">
              <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-500" />
            </div>
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-base text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Sorry, the admin page you are looking for doesn't exist, requires different permissions, or has been moved.
        </p>

        {/* Action Button */}
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-medium rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
        
      </div>
    </div>
  );
}