import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const ProtectedRoute = ({ adminOnly=false }: { adminOnly?: boolean }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/student/dashboard" replace />;
  if (!adminOnly && user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};
