import {
  useCallback,
  useEffect,
  useState,
} from '@lynx-js/react';

import './App.css';
import { useNavigate } from 'react-router';

interface GlobalProps {
  safeAreaTop: number;
  safeAreaBottom: number;
  safeAreaLeft: number;
  safeAreaRight: number;
}

export function App() {
  const [alterLogo, setAlterLogo] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [backButtonPressed, setBackButtonPressed] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const images = NativeModules.NativeLocalStorageModule.getImages();
    const splicedImages = images.splice(0, 5);
    console.log(JSON.stringify(splicedImages, null, 2));
    setImages(splicedImages);
  }, [lynx]);


  const onTap = useCallback((imageUrl: string) => {
    'background only';
    setAlterLogo(!alterLogo);
    nav('/test', { state: { imageUrl}});
  }, [alterLogo]);

  return (
    <>
      <view
        className="App"
      >
        <list
          list-type="flow"
          column-count={2}
          scroll-orientation="vertical"
          style={{ width: '100%', height: '100%' }}
        >
          <list-item item-key="start">
            <text className="Title" bindtap={() => setAlterLogo(!alterLogo)}>
              Images from device:
            </text>
          </list-item>
          <list-item item-key="backbutton">
            <text className="Tile">
              Back button pressed: {backButtonPressed ? 'Yes' : 'No'}
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
                  bindtap={() => onTap(image)}
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
