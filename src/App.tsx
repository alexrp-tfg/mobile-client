import {
  runOnMainThread,
  useCallback,
  useEffect,
  useLynxGlobalEventListener,
  useState,
} from '@lynx-js/react';

import './App.css';
import { useNavigate } from 'react-router';
import type { NativeModules } from '@lynx-js/types';

interface GlobalProps {
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export function App() {
  const [alterLogo, setAlterLogo] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    console.info('Hello, ReactLynx');
    console.log('Hello from the useEffect hook');
    NativeModules.NativeLocalStorageModule.setStorageItem(
      'lynx',
      'Hello, Lynx!',
    );
    console.log(
      'LocalStorage value: ',
      NativeModules.NativeLocalStorageModule.getStorageItem('lynx'),
    );
    console.log(lynx.__globalProps);
    setImages(NativeModules.NativeLocalStorageModule.getImages());

    NativeModules.NativeLocalStorageModule.registerBackButtonListener(() => {
      console.log('Back button pressed');
    });
  }, [lynx]);

  useLynxGlobalEventListener("backButtonPressed", () => {
    console.log('Back button pressed from global event listener');
    nav(-1);
  })

  const onTap = useCallback(() => {
    'background only';
    console.log(lynx.__globalProps);
    setAlterLogo(!alterLogo);
    nav('/test');
  }, [alterLogo]);

  console.log('Info');

  return (
    <>
      <view
        className="App"
        style={{
          paddingTop:
            (lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? '0px',
        }}
      >
        <list
          list-type="flow"
          column-count={2}
          scroll-orientation="vertical"
          style={{ width: '100%', height: '100%' }}
        >
          <list-item item-key="start">
            <text className="Title" bindtap={onTap}>
              Images from device:
            </text>
          </list-item>
          {images.length > 0 &&
            images.map((image, index) => (
              <list-item
                item-key={'image-' + index}
                key={'image-' + index}
                style={{ width: '100%', border: '1px solid white' }}
              >
                <image
                  src={image}
                  bindtap={onTap}
                  placeholder="Loading image..."
                  auto-size={true}
                  mode="aspectFill"
                />
              </list-item>
            ))}
          <list-item item-key="end">
            <text className="Title" item-key="end">
              End of the images
            </text>
          </list-item>
        </list>
      </view>
    </>
  );
}
