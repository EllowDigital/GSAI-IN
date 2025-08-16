import React from 'react';
import StudentManager from '@/components/admin/StudentManager';
import { AdminContainer } from '@/components/admin/AdminContainer';

export default function Students() {
  return (
    <AdminContainer>
      <StudentManager />
    </AdminContainer>
  );
}
