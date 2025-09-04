import { useState, useCallback, useEffect } from '@lynx-js/react';
import { LogoutButton } from '../../components/LogoutButton.js';

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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);

  // Load settings from storage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings =
          NativeModules.NativeLocalStorageModule.getStorageItem(
            'uploadSettings',
          );
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle message visibility transitions
  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const saveSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Save to native storage
      NativeModules.NativeLocalStorageModule.setStorageItem(
        'uploadSettings',
        JSON.stringify(settings),
      );
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [settings]);

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
  }, []);

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
      <view
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '16px',
          backgroundColor: message.includes('Error')
            ? 'rgba(220, 38, 127, 0.9)'
            : 'rgba(34, 197, 94, 0.9)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: message.includes('Error')
            ? '1px solid rgba(220, 38, 127, 0.3)'
            : '1px solid rgba(34, 197, 94, 0.3)',
          opacity: showMessage && message ? 1 : 0,
          transform: showMessage ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          visibility: showMessage ? 'visible' : 'hidden',
          pointerEvents: showMessage ? 'auto' : 'none',
        }}
      >
        <text
          style={{
            color: '#fff',
            fontSize: '14px',
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          {message}
        </text>
      </view>

      <scroll-view
        scroll-orientation="vertical"
        style={{
          width: '100%',
          height: '100%',
          paddingTop: '20px',
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
                  borderRadius: '13px',
                  position: 'absolute',
                  top: '2px',
                  left: settings.autoUpload ? '22px' : '2px',
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
            gap: '12px',
          }}
        >
          <view
            style={{
              flex: 1,
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
