import { useState } from '@lynx-js/react';
import { diContainer } from '../../../di/container.js';
import { LoadingButton } from './LoadingButton.js';
import { StatusMessage } from './StatusMessage.js';
import { useStatusMessage } from './useStatusMessage.js';

interface ServerSetupProps {
  onServerConfigured: () => void;
}

export function ServerSetup({ onServerConfigured }: ServerSetupProps) {
  const [serverIp, setServerIp] = useState('');
  const [port, setPort] = useState('8000');
  const [testing, setTesting] = useState(false);
  const { message, showMessage, clearMessage } = useStatusMessage();

  const validateServerUrl = (ip: string, port: string): string | null => {
    // Basic IP validation
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const hostnameRegex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!ip.trim()) {
      return 'Server IP/hostname is required';
    }

    if (!ipRegex.test(ip) && !hostnameRegex.test(ip) && ip !== 'localhost') {
      return 'Please enter a valid IP address or hostname';
    }

    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      return 'Port must be a number between 1 and 65535';
    }

    return null;
  };

  const testConnection = async (): Promise<boolean> => {
    const serverUrl = `http://${serverIp}:${port}/api`;

    try {
      const response = await fetch(`${serverUrl}/healthz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  };

  const handleContinue = async () => {
    const validation = validateServerUrl(serverIp, port);
    if (validation) {
      showMessage(validation, 'error');
      return;
    }

    setTesting(true);
    clearMessage();

    try {
      const isHealthy = await testConnection();

      if (isHealthy) {
        const serverUrl = `http://${serverIp}:${port}/api`;

        // Save to storage
        try {
          NativeModules.NativeLocalStorageModule.setStorageItem(
            'serverUrl',
            serverUrl,
          );

          // Update DI container with new server URL
          diContainer.updateServerUrl(serverUrl);

          showMessage('Server connection successful!');

          // Small delay to show success message
          setTimeout(() => {
            onServerConfigured();
          }, 1500);
        } catch (storageError) {
          console.error('Error saving server URL:', storageError);
          showMessage('Failed to save server configuration', 'error');
        }
      } else {
        showMessage(
          'Unable to connect to server. Please check the IP and port.',
          'error',
        );
      }
    } catch (error) {
      console.error('Connection test error:', error);
      showMessage('Connection test failed. Please try again.', 'error');
    } finally {
      setTesting(false);
    }
  };

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
          message.includes('Unable') ||
          message.includes('Failed')
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
            Server Configuration
          </text>
          <text
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '20px',
            }}
          >
            Please enter your server details to continue
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
            Server IP or Hostname
          </text>
          <input
            placeholder="192.168.1.100 or localhost"
            value={serverIp}
            bindinput={(e) => setServerIp(e.detail.value)}
            text-color='#ffffff'
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
            Port
          </text>
          <input
            placeholder="8000"
            value={port}
            bindinput={(e) => setPort(e.detail.value)}
            text-color='#ffffff'
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
          text="Test Connection & Continue"
          loadingText="Testing connection..."
          loading={testing}
          onTap={handleContinue}
          variant="primary"
          disabled={!serverIp.trim() || !port.trim()}
        />

        <view style={{ marginTop: '16px', textAlign: 'center' }}>
          <text
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '16px',
            }}
          >
            This will test the connection to /api/healthz endpoint
          </text>
        </view>
      </view>
    </view>
  );
}
