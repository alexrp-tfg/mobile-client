import { useLynxGlobalEventListener, useState } from '@lynx-js/react';
import type { GlobalProps } from '@lynx-js/types';
import { useNavigate } from 'react-router';

export function Test() {
  const nav = useNavigate();
  const [backButtonPressed, setBackButtonPressed] = useState(false);

  useLynxGlobalEventListener('backButtonPressed', () => {
    console.log('Back button pressed from global event listener for the test component');
    setBackButtonPressed(true);
    nav(-1);
  });
  return (
    <>
      <view
        bindtap={() => {
          nav(-1);
        }}
        style={{
          width: '100%',
          height: '100%',
          color: 'white',
          paddingTop:
            (lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? '0px',
        }}
      >
        <text>Back button pressed {backButtonPressed ? 'Yes' : 'No'}</text>
      </view>
    </>
  );
}
