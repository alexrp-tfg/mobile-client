type ToggleButtonProps = {
  value: boolean;
  onToggle: (newValue: boolean) => void;
};

export function ToggleButton({ value, onToggle }: ToggleButtonProps) {
  return (
    <view
      style={{
        width: '50px',
        height: '30px',
        backgroundColor: value
          ? 'rgba(34, 197, 94, 0.9)'
          : 'rgba(107, 114, 128, 0.9)',
        borderRadius: '15px',
        border: value
          ? '1px solid rgba(34, 197, 94, 0.3)'
          : '1px solid rgba(107, 114, 128, 0.3)',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      bindtap={() => onToggle(!value)}
    >
      <view
        style={{
          width: '26px',
          height: '26px',
          backgroundColor: '#fff',
          borderRadius: '15px',
          position: 'absolute',
          top: '1px',
          left: value ? 'auto' : '2px',
          right: value ? '2px' : 'auto',
          transition: 'left 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      />
    </view>
  );
}
