import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboardRoute } from './routeConfig';

interface PublicRouteProps {
  children: ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
