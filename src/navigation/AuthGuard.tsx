import { useEffect, useRef } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../modules/authorization/presentation/useAuth.js';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard component prevents authenticated users from accessing certain routes (like login page)
 * Redirects authenticated users to the specified route (default: home page)
 */
export function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  console.log('Rendering AuthGuard');

  useEffect(() => {
    if (isInitialized && isAuthenticated && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate(redirectTo, { replace: true });
    } else if (!isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isInitialized, navigate, redirectTo]);

  // Don't render anything until auth state is initialized
  if (!isInitialized) {
    return null;
  }

  // If user is authenticated, don't render the children (they will be redirected)
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
