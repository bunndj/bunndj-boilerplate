import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { defaultRoute } from './routeConfig';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
