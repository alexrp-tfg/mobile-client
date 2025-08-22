import { useState, useEffect } from '@lynx-js/react';
import { AuthManager, type AuthState } from '../infrastructure/AuthManager.js';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const authManager = AuthManager.getInstance();
    return authManager.getState();
  });

  useEffect(() => {
    const authManager = AuthManager.getInstance();
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []); // Empty dependency array since AuthManager is a singleton

  return {
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    isInitialized: authState.isInitialized,
    login: (token: string) => AuthManager.getInstance().setAuthenticated(token),
    logout: () => AuthManager.getInstance().setUnauthenticated(),
  };
}
