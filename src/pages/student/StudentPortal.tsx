import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import StudentDashboard from './StudentDashboard';
import StudentSetPassword from './StudentSetPassword';
import { StudentAuthProvider } from './StudentAuthProvider';

export default function StudentPortal() {
  return (
    <StudentAuthProvider>
      <Routes>
        <Route path="login" element={<StudentLogin />} />
        <Route path="set-password" element={<StudentSetPassword />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route index element={<Navigate to="login" replace />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    </StudentAuthProvider>
  );
}
