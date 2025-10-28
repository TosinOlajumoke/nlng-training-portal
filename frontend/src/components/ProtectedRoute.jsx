import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children, roles }){
  const { user, token } = useAuth();
  if(!token) return <Navigate to="/login" replace />;
  if(roles && (!user || !roles.includes(user.role))) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
