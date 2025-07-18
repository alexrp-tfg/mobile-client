import { useCallback, useEffect, useState } from '@lynx-js/react';

import './App.css';

import arrow from './assets/arrow.png';
import lynxLogo from './assets/lynx-logo.png';
import reactLynxLogo from './assets/react-logo.png';

interface GlobalProps {
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}


export function App() {
  const [alterLogo, setAlterLogo] = useState(false);
  const [images, setImages] = useState<string[]>([]);

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
  }, [lynx]);

  const onTap = useCallback(() => {
    'background only';
    console.log(lynx.__globalProps);
    setAlterLogo(!alterLogo);
  }, [alterLogo]);

  console.log('Info');

  return (
    <>
      <view className="Background" />
      <view className="App" style={{ paddingTop: (lynx.__globalProps as GlobalProps)?.['safeAreaTop'] ?? 0 }}>
        <view
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <list
            list-type='waterfall'
            column-count={2}
            style={{
              zIndex: 1,
              flexGrow: 1
            }}
          >
            <list-item item-key='start'>
              <text className="Title" bindtap={onTap}>
                Images from device:
              </text>
            </list-item>
            {images.length > 0 &&
              images.map((image, index) => (
                <list-item item-key={'image-' + index} key={'image-' + index}>
                  <image
                    src={image}
                    bindtap={onTap}
                    placeholder="Loading image..."
                    style={{ width: '200px', height: '200px' }}
                  />
                </list-item>
              ))}
            <list-item item-key='end'>
              <text className="Title" item-key="end">End of the images</text>
            </list-item>
          </list>
          <view
            style={{
              backgroundColor: 'white',
              color: 'black',
              flexShrink: 0,
              height: '200px',
              width: '100%',
              marginBottom: '20px',
            }}
            bindtap={onTap}
          >
            <text style={{color: 'black'}}>Button</text>
          </view>
        </view>
      </view>
    </>
  );
}
