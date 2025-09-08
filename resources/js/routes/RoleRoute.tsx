import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/unauthorized' 
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
