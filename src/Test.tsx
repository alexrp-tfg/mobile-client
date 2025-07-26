import type { GlobalProps } from '@lynx-js/types';
import { useLocation, useNavigate } from 'react-router';
import './Test.css'

export function Test() {
  const nav = useNavigate();
  const location = useLocation();

  const imageUrl = location.state?.imageUrl;
  return (
    <>
      <view
        bindtap={() => {
          nav('/');
        }}
        style={{
          width: '100%',
          height: '50%',
          color: 'white',
          paddingTop: (lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? 0,
        }}
      >
        <text>Back button pressed no</text>
        <image
          src={imageUrl}
          auto-size={true}
          mode="aspectFill"
          placeholder="Loading image..."
        ></image>
      </view>
      <input 
        className="input-box"
        text-color="#000000"
        placeholder='Type something...'
        bindinput={(e: any) => {
          console.log('Input event:', e);
        }}
      />
    </>
  );
}
