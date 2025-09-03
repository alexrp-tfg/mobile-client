import { useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../di/container.js';
import { LoadingButton } from './LoadingButton.js';

interface LogoutButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  className?: string;
  redirectTo?: string;
}

export function LogoutButton({
  text = 'Logout',
  variant = 'secondary',
  className = '',
  redirectTo = '/login',
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoutUserUseCase = diContainer.getLogoutUserUseCase();

  const handleLogout = async () => {
    setLoading(true);

    try {
      // Use requestAnimationFrame to ensure the loading state is rendered
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50);
        });
      });

      logoutUserUseCase.execute();

      // Navigate to login page with replace to prevent going back
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton
      text={text}
      loadingText="Logging out..."
      loading={loading}
      variant={variant}
      onTap={handleLogout}
      className={className}
    />
  );
}
