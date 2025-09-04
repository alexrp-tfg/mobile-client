import { useCallback } from '@lynx-js/react';
import { useLocation, useNavigate } from 'react-router';
import { getActiveNavigationItems } from './navigation-config.js';

export function BottomNavigationBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeItems = getActiveNavigationItems(location.pathname);

  const handleNavigation = useCallback(
    (route: string) => {
      navigate(route, { replace: true });
    },
    [navigate],
  );

  return (
    <view
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: '80px',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: '8px',
        zIndex: 1000,
      }}
    >
      {activeItems.map((item) => (
        <view
          key={item.id}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            cursor: 'pointer',
          }}
          bindtap={() => handleNavigation(item.route)}
        >
          {/* Icon */}
          <view
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '4px',
              backgroundColor: item.isActive
                ? 'rgba(59, 130, 246, 0.2)'
                : 'transparent',
              borderRadius: '16px',
              padding: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <text
              style={{
                fontSize: '18px',
                color: item.isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.2s ease',
              }}
            >
              {item.isActive ? item.activeIcon || item.icon : item.icon}
            </text>
          </view>

          {/* Label */}
          <text
            style={{
              fontSize: '10px',
              color: item.isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.6)',
              fontWeight: item.isActive ? '600' : '400',
              textAlign: 'center',
              transition: 'color 0.2s ease',
              lineHeight: '12px',
            }}
          >
            {item.label}
          </text>

          {/* Active Indicator */}
          {item.isActive && (
            <view
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                marginTop: '2px',
              }}
            />
          )}
        </view>
      ))}
    </view>
  );
}
