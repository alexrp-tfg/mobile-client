import { useState, useCallback, useEffect } from '@lynx-js/react';
import { diContainer } from '../../di/container.js';
import { LogoutButton } from '../shared/presentation/LogoutButton.js';
import { LoadingButton } from '../shared/presentation/LoadingButton.js';
import { StatusMessage } from '../shared/presentation/StatusMessage.js';
import { useStatusMessage } from '../shared/presentation/useStatusMessage.js';

interface UploadSettings {
  maxParallelUploads: number;
  autoUpload: boolean;
}

const DEFAULT_SETTINGS: UploadSettings = {
  maxParallelUploads: 3,
  autoUpload: false,
};

export function SettingsPage() {
  const [settings, setSettings] = useState<UploadSettings>(DEFAULT_SETTINGS);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { message, showMessage: setMessage, clearMessage } = useStatusMessage();

  // Load settings from storage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        // Load upload settings
        const savedSettings =
          NativeModules.NativeLocalStorageModule.getStorageItem(
            'uploadSettings',
          );
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }

        // Load server URL
        const savedServerUrl =
          NativeModules.NativeLocalStorageModule.getStorageItem('serverUrl');
        if (savedServerUrl) {
          setServerUrl(savedServerUrl);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(async () => {
    setLoading(true);
    try {
      const settingsJson = JSON.stringify(settings);
      NativeModules.NativeLocalStorageModule.setStorageItem(
        'uploadSettings',
        settingsJson,
      );
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [settings, setMessage]);

  const handleParallelUploadsChange = useCallback((value: number) => {
    const clampedValue = Math.max(1, Math.min(10, value));
    setSettings((prev) => ({ ...prev, maxParallelUploads: clampedValue }));
  }, []);

  const handleAutoUploadToggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, autoUpload: !prev.autoUpload }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setMessage('Settings reset to defaults');
  }, [setMessage]);

  // Server URL management functions
  const testServerConnection = useCallback(async (): Promise<boolean> => {
    if (!serverUrl) return false;

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
  }, [serverUrl]);

  const handleTestConnection = useCallback(async () => {
    if (!serverUrl) {
      setMessage('Server URL is required', 'error');
      return;
    }

    setTestingConnection(true);
    clearMessage();

    try {
      const isHealthy = await testServerConnection();

      if (isHealthy) {
        setMessage('Server connection successful!');
      } else {
        setMessage(
          'Unable to connect to server. Please check the URL.',
          'error',
        );
      }
    } catch (error) {
      console.error('Connection test error:', error);
      setMessage('Connection test failed. Please try again.', 'error');
    } finally {
      setTestingConnection(false);
    }
  }, [serverUrl, testServerConnection, setMessage, clearMessage]);

  const saveServerUrl = useCallback(async () => {
    if (!serverUrl.trim()) {
      setMessage('Server URL is required', 'error');
      return;
    }

    setLoading(true);
    try {
      NativeModules.NativeLocalStorageModule.setStorageItem(
        'serverUrl',
        serverUrl,
      );

      // Update DI container with new server URL
      diContainer.updateServerUrl(serverUrl);

      setMessage('Server URL saved successfully!');
    } catch (error) {
      console.error('Error saving server URL:', error);
      setMessage('Error saving server URL. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [serverUrl, setMessage]);

  const parseServerUrl = (url: string): { ip: string; port: string } => {
    try {
      const cleanUrl = url.replace(/^https?:\/\//, '').replace(/\/api$/, '');
      const parts = cleanUrl.split(':');
      return {
        ip: parts[0] || '',
        port: parts[1] || '8000',
      };
    } catch {
      return { ip: '', port: '8000' };
    }
  };

  const updateServerUrl = (ip: string, port: string) => {
    const newUrl = `http://${ip}:${port}/api`;
    setServerUrl(newUrl);
  };

  return (
    <view
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
        paddingBottom: '80px', // Account for bottom navigation
      }}
    >
      {/* Status Message */}
      <StatusMessage
        message={message}
        type={message.includes('Error') ? 'error' : 'success'}
        onHide={clearMessage}
      />

      <scroll-view
        scroll-orientation="vertical"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {/* Header */}
        <view
          style={{
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <text
            style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '8px',
            }}
          >
            Settings
          </text>
          <text
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '20px',
            }}
          >
            Configure your upload preferences and app behavior
          </text>
        </view>

        {/* Server Settings Section */}
        <view
          style={{
            margin: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <text
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            Server Settings
          </text>

          {/* Server URL Configuration */}
          <view style={{ marginBottom: '24px' }}>
            <text
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              Server IP/Hostname
            </text>
            <input
              placeholder="192.168.1.100 or localhost"
              value={parseServerUrl(serverUrl).ip}
              bindinput={(e) => {
                const { port } = parseServerUrl(serverUrl);
                updateServerUrl(e.detail.value, port);
              }}
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
              value={parseServerUrl(serverUrl).port}
              bindinput={(e) => {
                const { ip } = parseServerUrl(serverUrl);
                updateServerUrl(ip, e.detail.value);
              }}
              text-color='#ffffff'
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            />

            <view
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <LoadingButton
                text="Test Connection"
                loadingText="Testing..."
                loading={testingConnection}
                onTap={handleTestConnection}
                variant="secondary"
                disabled={!serverUrl}
              />

              <LoadingButton
                text="Save Server URL"
                loadingText="Saving..."
                loading={loading}
                onTap={saveServerUrl}
                variant="primary"
                disabled={!serverUrl}
              />
            </view>

            {serverUrl && (
              <view style={{ marginTop: '12px' }}>
                <text
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  Current URL: {serverUrl}
                </text>
              </view>
            )}
          </view>
        </view>

        {/* Upload Settings Section */}
        <view
          style={{
            margin: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <text
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            Upload Settings
          </text>

          {/* Max Parallel Uploads */}
          <view
            style={{
              marginBottom: '24px',
            }}
          >
            <text
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              Max Parallel Uploads: {settings.maxParallelUploads}
            </text>
            <text
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '12px',
                lineHeight: '16px',
              }}
            >
              Controls how many images can upload simultaneously. Lower values
              use less memory.
            </text>

            {/* Parallel Upload Controls */}
            <view
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <view
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(107, 114, 128, 0.9)',
                  borderRadius: '20px',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                }}
                bindtap={() =>
                  handleParallelUploadsChange(settings.maxParallelUploads - 1)
                }
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  -
                </text>
              </view>

              <view
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 20px',
                  backgroundColor: 'rgba(59, 130, 246, 0.9)',
                  borderRadius: '20px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  minWidth: '60px',
                  textAlign: 'center',
                }}
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {settings.maxParallelUploads}
                </text>
              </view>

              <view
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(107, 114, 128, 0.9)',
                  borderRadius: '20px',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                }}
                bindtap={() =>
                  handleParallelUploadsChange(settings.maxParallelUploads + 1)
                }
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  +
                </text>
              </view>
            </view>
          </view>

          {/* Auto Upload Toggle */}
          <view
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <view style={{ flex: 1 }}>
              <text
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#fff',
                  marginBottom: '4px',
                }}
              >
                Auto Upload
              </text>
              <text
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: '16px',
                }}
              >
                Automatically upload new images when detected
              </text>
            </view>

            <view
              style={{
                width: '50px',
                height: '30px',
                backgroundColor: settings.autoUpload
                  ? 'rgba(34, 197, 94, 0.9)'
                  : 'rgba(107, 114, 128, 0.9)',
                borderRadius: '15px',
                border: settings.autoUpload
                  ? '1px solid rgba(34, 197, 94, 0.3)'
                  : '1px solid rgba(107, 114, 128, 0.3)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              bindtap={handleAutoUploadToggle}
            >
              <view
                style={{
                  width: '26px',
                  height: '26px',
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  position: 'absolute',
                  top: '1px',
                  left: settings.autoUpload ? 'auto' : '2px',
                  right: settings.autoUpload ? '2px' : 'auto',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
              />
            </view>
          </view>
        </view>

        {/* Action Buttons */}
        <view
          style={{
            margin: '20px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <view
            style={{
              padding: '16px',
              backgroundColor: loading
                ? 'rgba(107, 114, 128, 0.5)'
                : 'rgba(59, 130, 246, 0.9)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              textAlign: 'center',
              opacity: loading ? 0.6 : 1,
            }}
            bindtap={loading ? undefined : saveSettings}
          >
            <text
              style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </text>
          </view>

          <view
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(107, 114, 128, 0.9)',
              borderRadius: '12px',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              textAlign: 'center',
            }}
            bindtap={resetToDefaults}
          >
            <text
              style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              Reset
            </text>
          </view>
        </view>

        {/* Account Section */}
        <view
          style={{
            margin: '20px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <text
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            Account
          </text>

          <LogoutButton text="Logout" variant="danger" redirectTo="/login" />
        </view>

        {/* Footer */}
        <view
          style={{
            padding: '40px 20px 20px',
            textAlign: 'center',
          }}
        >
          <text
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            Lynx Gallery Settings
          </text>
        </view>
      </scroll-view>
    </view>
  );
}
