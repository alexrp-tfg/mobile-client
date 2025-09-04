import { useState, useEffect, useCallback, useRef } from '@lynx-js/react';

interface ServerStatusProps {
  serverUrl?: string;
  compact?: boolean;
}

export function ServerStatus({
  serverUrl,
  compact = false,
}: ServerStatusProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const healthCheckRef = useRef<(() => Promise<void>) | null>(null);

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
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
      console.error('Server health check failed:', error);
      return false;
    }
  }, [serverUrl]);

  const performHealthCheck = useCallback(async () => {
    if (!serverUrl) return;

    setIsChecking((prev) => {
      if (prev) return prev; // Already checking, don't start another
      return true;
    });

    try {
      const healthy = await checkServerHealth();
      setIsOnline(healthy);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check error:', error);
      setIsOnline(false);
      setLastChecked(new Date());
    } finally {
      setIsChecking(false);
    }
  }, [serverUrl, checkServerHealth]);

  // Store the function in ref to avoid dependency issues
  healthCheckRef.current = performHealthCheck;

  // Initial health check
  useEffect(() => {
    if (serverUrl) {
      healthCheckRef.current?.();
    } else {
      setIsOnline(null);
      setLastChecked(null);
    }
  }, [serverUrl]);

  // Periodic health check every 30 seconds
  useEffect(() => {
    if (!serverUrl) return;

    const interval = setInterval(() => {
      healthCheckRef.current?.();
    }, 30000);

    return () => clearInterval(interval);
  }, [serverUrl]);

  // Don't render if no server URL
  if (!serverUrl) return null;

  const getStatusColor = () => {
    if (isChecking) return 'rgba(59, 130, 246, 0.9)'; // Blue for checking
    if (isOnline === null) return 'rgba(107, 114, 128, 0.9)'; // Gray for unknown
    return isOnline ? 'rgba(34, 197, 94, 0.9)' : 'rgba(220, 38, 127, 0.9)'; // Green/Red
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isOnline === null) return 'Unknown';
    return isOnline ? 'Online' : 'Offline';
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    if (isOnline === null) return '❓';
    return isOnline ? '🟢' : '🔴';
  };

  if (compact) {
    return (
      <view
        style={{
          padding: '6px 12px',
          backgroundColor: getStatusColor(),
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '6px',
        }}
        bindtap={performHealthCheck}
      >
        <text style={{ fontSize: '10px' }}>{getStatusIcon()}</text>
        <text
          style={{
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
          }}
        >
          {getStatusText()}
        </text>
      </view>
    );
  }

  return (
    <view
      style={{
        padding: '12px 16px',
        backgroundColor: getStatusColor(),
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
      bindtap={performHealthCheck}
    >
      <view
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <text style={{ fontSize: '16px' }}>{getStatusIcon()}</text>
        <view>
          <text
            style={{
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Server {getStatusText()}
          </text>
          {lastChecked && (
            <text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '12px',
              }}
            >
              Last checked: {lastChecked.toLocaleTimeString()}
            </text>
          )}
        </view>
      </view>

      <text
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
        }}
      >
        Tap to refresh
      </text>
    </view>
  );
}
