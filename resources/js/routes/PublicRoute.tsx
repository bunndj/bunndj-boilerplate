import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import LoadingSpinner from '@/components/LoadingSpinner';
import { dashboardRoute } from './routeConfig';

interface PublicRouteProps {
  children: ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔍 [PublicRoute] Route check:', {
    pathname: location.pathname,
    isAuthenticated,
    isLoading,
    isInvitationPage: location.pathname.startsWith('/invitation/'),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Allow invitation pages to be accessed by authenticated users
  if (isAuthenticated && !location.pathname.startsWith('/invitation/')) {
    console.log('🔍 [PublicRoute] Redirecting authenticated user to dashboard');
    return <Navigate to={dashboardRoute} replace />;
  }

  console.log('🔍 [PublicRoute] Rendering public route');
  return <>{children}</>;
}

export default PublicRoute;
