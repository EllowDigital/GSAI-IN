import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundAdmin() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="p-4 rounded-full bg-yellow-100 dark:bg-yellow-800/30">
            <AlertTriangle className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mb-2">
          404 – Page Not Found
        </h2>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Sorry, the admin page you're looking for doesn't exist or has been
          moved.
        </p>

        {/* Back to Dashboard Button */}
        <Link
          to="/admin/dashboard"
          className="inline-block mt-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-sm transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
