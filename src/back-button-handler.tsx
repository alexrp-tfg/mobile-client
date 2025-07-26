import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useLynxGlobalEventListener } from '@lynx-js/react';

export function BackButtonHandler() {
  const nav = useNavigate();
  const handleBackButton = useCallback(() => {
    nav(-1);
    console.log('Back button pressed, navigating back');
    console.log(nav)
  }, [nav]);
  useLynxGlobalEventListener('backButtonPressed', handleBackButton);
  return null;
}
