import { useState, useEffect } from '@lynx-js/react';

interface StatusMessageProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  autoHide?: boolean;
  autoHideDelay?: number;
  onHide?: () => void;
}

export function StatusMessage({
  message,
  type = 'success',
  position = 'top',
  autoHide = true,
  autoHideDelay = 3000,
  onHide,
}: StatusMessageProps) {
  const [showMessage, setShowMessage] = useState(false);

  // Handle message visibility transitions
  useEffect(() => {
    if (message) {
      setShowMessage(true);

      if (autoHide) {
        const timer = setTimeout(() => {
          setShowMessage(false);
          setTimeout(() => {
            onHide?.();
          }, 300); // Wait for fade-out transition
        }, autoHideDelay);

        return () => clearTimeout(timer);
      }
    } else {
      // Delay hiding to allow fade-out transition
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [message, autoHide, autoHideDelay, onHide]);

  // Don't render if no message
  if (!message && !showMessage) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'rgba(220, 38, 127, 0.9)';
      case 'info':
        return 'rgba(59, 130, 246, 0.9)';
      case 'success':
      default:
        return 'rgba(34, 197, 94, 0.9)';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return '1px solid rgba(220, 38, 127, 0.3)';
      case 'info':
        return '1px solid rgba(59, 130, 246, 0.3)';
      case 'success':
      default:
        return '1px solid rgba(34, 197, 94, 0.3)';
    }
  };

  const positionStyles =
    position === 'top' ? { top: '20px' } : { bottom: '20px' };

  return (
    <view
      style={{
        position: 'absolute',
        ...positionStyles,
        left: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '16px',
        backgroundColor: getBackgroundColor(),
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: getBorderColor(),
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
  );
}
