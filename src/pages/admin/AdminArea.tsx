import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminAuthProvider } from './AdminAuthProvider';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import NotFoundAdmin from './NotFoundAdmin';
import DashboardHome from './dashboard/DashboardHome';
import Blogs from './dashboard/Blogs';
import News from './dashboard/News';
import Gallery from './dashboard/Gallery';
import Students from './dashboard/Students';
import FeesManager from './dashboard/FeesManager';
import Events from './dashboard/Events';

const AdminArea = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route path="dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="fees" element={<FeesManager />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="news" element={<News />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="students" element={<Students />} />
          <Route path="events" element={<Events />} />
          <Route path="*" element={<NotFoundAdmin />} />
        </Route>
        <Route path="*" element={<NotFoundAdmin />} />
      </Routes>
    </AdminAuthProvider>
  );
};

export default AdminArea;
