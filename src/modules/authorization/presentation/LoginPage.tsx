import { useState, useCallback } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { LoadingButton } from '../../shared/presentation/LoadingButton.js';
import { StatusMessage } from '../../shared/presentation/StatusMessage.js';
import { useStatusMessage } from '../../shared/presentation/useStatusMessage.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { message, showMessage, clearMessage } = useStatusMessage();

  const loginUserUseCase = diContainer.getLoginUserUseCase();

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      showMessage('Please enter both username and password', 'error');
      return;
    }

    setLoading(true);
    clearMessage();

    try {
      const success = await loginUserUseCase.execute(username.trim(), password);

      if (success) {
        showMessage('Login successful!');
        // Small delay to show success message
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        showMessage('Invalid credentials. Please try again.', 'error');
      }
    } catch {
      showMessage(
        'Login failed. Please check your connection and try again.',
        'error',
      );
    } finally {
      setLoading(false);
    }
  }, [
    username,
    password,
    loginUserUseCase,
    navigate,
    showMessage,
    clearMessage,
  ]);

  return (
    <view
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <StatusMessage
        message={message}
        type={
          message.includes('Error') ||
          message.includes('Invalid') ||
          message.includes('failed')
            ? 'error'
            : 'success'
        }
        onHide={clearMessage}
      />

      <view
        style={{
          width: '90%',
          maxWidth: '400px',
          padding: '32px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <view style={{ textAlign: 'center', marginBottom: '32px' }}>
          <text
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            Welcome Back
          </text>
          <text
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '20px',
            }}
          >
            Please sign in to your account
          </text>
        </view>

        <view style={{ marginBottom: '24px' }}>
          <text
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            Username
          </text>
          <input
            placeholder="Enter your username"
            value={username}
            bindinput={(e) => setUsername(e.detail.value)}
            text-color="#ffffff"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
          />
        </view>

        <view style={{ marginBottom: '32px' }}>
          <text
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            Password
          </text>
          <input
            placeholder="Enter your password"
            value={password}
            bindinput={(e) => setPassword(e.detail.value)}
            text-color="#ffffff"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
            }}
          />
        </view>

        <LoadingButton
          text="Sign In"
          loadingText="Signing in..."
          loading={loading}
          onTap={handleLogin}
          variant="primary"
          disabled={!username.trim() || !password.trim()}
        />

        <view style={{ marginTop: '16px', textAlign: 'center' }}>
          <text
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '16px',
            }}
          >
            Enter your credentials to access the application
          </text>
        </view>
      </view>
    </view>
  );
}
