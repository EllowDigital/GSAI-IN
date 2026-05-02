import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { StudentAuthProvider } from './StudentAuthProvider';
import { Loader2 } from 'lucide-react';

// --- Lazy Loaded Routes ---
// These components are only downloaded when the user specifically visits their route,
// drastically improving the initial page load speed.
const StudentLogin = lazy(() => import('./StudentLogin'));
const StudentLanding = lazy(() => import('./StudentLanding'));
const StudentSetPassword = lazy(() => import('./StudentSetPassword'));
const StudentDashboard = lazy(() => import('./StudentDashboard'));

// --- Loading Fallback ---
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 space-y-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
    <p className="text-sm font-medium text-muted-foreground animate-pulse">
      Loading...
    </p>
  </div>
);

export default function StudentPortal() {
  return (
    <StudentAuthProvider>
      {/* Suspense catches the loading state of our lazy imports */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main App Routes */}
          <Route index element={<StudentLanding />} />
          <Route path="login" element={<StudentLogin />} />
          <Route path="set-password" element={<StudentSetPassword />} />
          <Route path="dashboard" element={<StudentDashboard />} />

          {/* Redirects */}
          {/* If the user is logged in, the StudentAuthProvider will intercept 
              this login redirect and securely send them to the dashboard. */}
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </Suspense>
    </StudentAuthProvider>
  );
}
