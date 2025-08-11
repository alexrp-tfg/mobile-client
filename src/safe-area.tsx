import type { GlobalProps } from '@lynx-js/types';

interface SafeAreaViewProps {
  children: React.ReactNode;
}

export const SafeAreaView = ({ children }: SafeAreaViewProps) => {
  return (
    <view
      style={{
        paddingTop: `${(lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? 0}px`,
        paddingBottom: `${(lynx.__globalProps as GlobalProps)?.['safeAreaBottom'] ?? 0}px`,
        paddingLeft: `${(lynx.__globalProps as GlobalProps)?.['safeAreaLeft'] ?? 0}px`,
        paddingRight: `${(lynx.__globalProps as GlobalProps)?.['safeAreaRight'] ?? 0}px`,
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </view>
  );
};
