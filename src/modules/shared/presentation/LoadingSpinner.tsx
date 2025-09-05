import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'medium',
  color = '#007bff',
  text,
  overlay = false,
}: LoadingSpinnerProps) {
  const spinnerClass = `loading-spinner loading-spinner--${size}`;
  const containerClass = overlay
    ? 'loading-spinner--overlay'
    : 'loading-spinner__container';
  const textClass = `loading-spinner__text loading-spinner__text--${size}`;

  const spinnerStyle = {
    borderTopColor: color,
  };

  const textStyle = {
    color: color,
  };

  return (
    <view className={containerClass}>
      <view className={spinnerClass} style={spinnerStyle} />
      {text && (
        <text className={textClass} style={textStyle}>
          {text}
        </text>
      )}
    </view>
  );
}
