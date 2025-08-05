import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLynxGlobalEventListener } from '@lynx-js/react';

export function BackButtonHandler() {
  const nav = useNavigate();
  const location = useLocation();

  const handleBackButton = useCallback(() => {
    if (location.pathname === '/') NativeModules.NativeLocalStorageModule.endActivity();
    nav(-1);
  }, [nav]);

  useLynxGlobalEventListener('backButtonPressed', handleBackButton);

  return null;
}
