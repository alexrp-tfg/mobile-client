import { useState, useCallback } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginUserUseCase = diContainer.getLoginUserUseCase();

  const handleLogin = useCallback(async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const success = await loginUserUseCase.execute(username.trim(), password);

      if (success) {
        navigate('/', { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch {
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [username, password, loginUserUseCase, navigate]);

  return (
    <view
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <view
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <view style={{ textAlign: 'center', marginBottom: '30px' }}>
          <text
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333333',
            }}
          >
            Sign In
          </text>
        </view>

        <view style={{ marginBottom: '20px' }}>
          <text
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555555',
            }}
          >
            User
          </text>
          <input
            value={username}
            placeholder="Enter your username"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: loading ? '#f0f0f0' : '#ffffff',
            }}
            bindinput={(e) => setUsername(e.detail.value)}
          />
        </view>

        <view style={{ marginBottom: '20px' }}>
          <text
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#555555',
            }}
          >
            Password
          </text>
          <input
            value={password}
            placeholder="Enter your password"
            style={{
              width: '100%',
              height: '40px',
              paddingLeft: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              backgroundColor: loading ? '#f0f0f0' : '#ffffff',
            }}
            bindinput={(e) => setPassword(e.detail.value)}
          />
        </view>

        {error && (
          <view
            style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
            }}
          >
            <text style={{ color: '#c33', fontSize: '14px' }}>{error}</text>
          </view>
        )}

        <view
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#cccccc' : '#007bff',
            borderRadius: '4px',
            textAlign: 'center',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          bindtap={loading ? undefined : handleLogin}
        >
          <text
            style={{
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '500',
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </text>
        </view>
      </view>
    </view>
  );
}
