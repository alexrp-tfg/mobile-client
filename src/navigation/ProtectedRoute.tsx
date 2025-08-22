import { useEffect, useRef } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../modules/authorization/presentation/useAuth.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (isInitialized && !isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate('/', { replace: true });
    } else if (isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Don't render anything until auth state is initialized
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
