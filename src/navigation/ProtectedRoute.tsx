import { useEffect, useRef } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { useAuth } from '../modules/authorization/presentation/useAuth.js';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('Rendering ProtectedRoute');
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  useEffect(() => {
    console.log('ProtectedRoute useEffect:', {
      isInitialized,
      isAuthenticated,
      hasNavigated: hasNavigated.current,
    });
    if (isInitialized && !isAuthenticated && !hasNavigated.current) {
      console.log('Attempting to navigate to /login');
      hasNavigated.current = true;
      // Use setTimeout to ensure navigation happens after current render cycle
      setTimeout(() => {
        navigate('/login', { replace: true });
        console.log('Navigation call completed');
      }, 0);
    } else if (isAuthenticated) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, isInitialized, navigate]);

  // Don't render anything until auth state is initialized
  if (!isInitialized) {
    console.log('Auth state not initialized, rendering nothing');
    return null;
  }

  if (!isAuthenticated) {
    console.log('User is not authenticated, will redirect to login');
    return null;
  }

  return <>{children}</>;
}
