import { useState } from '@lynx-js/react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function RefreshButton({
  onRefresh,
  disabled = false,
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <view
      style={{
        padding: '12px',
        backgroundColor: isRefreshing
          ? 'rgba(59, 130, 246, 0.7)'
          : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'all 0.3s ease',
      }}
      bindtap={handleRefresh}
    >
      <text
        style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: '600',
        }}
      >
        🔄
      </text>
    </view>
  );
}
