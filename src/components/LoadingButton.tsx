import { LoadingSpinner } from './LoadingSpinner.js';
import './LoadingButton.css';

interface LoadingButtonProps {
  text: string;
  loadingText?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  onTap?: () => void;
  className?: string;
}

export function LoadingButton({
  text,
  loadingText = 'Loading...',
  loading = false,
  disabled = false,
  variant = 'primary',
  onTap,
  className = '',
}: LoadingButtonProps) {
  const getButtonClass = () => {
    let classes = 'loading-button';

    if (className) classes += ` ${className}`;
    if (loading) classes += ' loading-button--loading';
    if (disabled) classes += ' loading-button--disabled';
    if (variant !== 'primary') classes += ` loading-button--${variant}`;

    return classes;
  };

  return (
    <view
      className={getButtonClass()}
      bindtap={loading || disabled ? undefined : onTap}
    >
      {loading && (
        <view className="loading-button__spinner">
          <LoadingSpinner
            size="small"
            color={
              variant === 'warning' || (loading && variant === 'primary')
                ? '#212529'
                : 'white'
            }
          />
        </view>
      )}
      <text className="loading-button__text">
        {loading ? loadingText : text}
      </text>
    </view>
  );
}
