import { useCallback, useEffect, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import type { Gallery } from '../domain/entities.js';

export function ImageGallery() {
  const [alterLogo, setAlterLogo] = useState(false);
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const getGalleryImagesUseCase = diContainer.getGetGalleryImagesUseCase();

  useEffect(() => {
    const loadGallery = async () => {
      setLoading(true);
      try {
        const galleryResult = await getGalleryImagesUseCase.execute(5);
        setGallery(galleryResult);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const onTap = useCallback(
    (imageUrl: string) => {
      'background only';
      setAlterLogo(!alterLogo);
      nav('/upload', { state: { imageUrl } });
    },
    [alterLogo, nav],
  );

  if (loading) {
    return (
      <view className="App">
        <text className="Title">Loading images...</text>
      </view>
    );
  }

  const images = gallery?.images || [];

  return (
    <view className="App">
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
        {images.length > 0 &&
          images.map((image) => (
            <list-item
              item-key={image.id}
              key={image.id}
              style={{ width: '100%', border: '1px solid white' }}
            >
              <image
                src={image.url}
                bindtap={() => onTap(image.url)}
                placeholder="Loading image..."
                auto-size={true}
                mode="aspectFill"
              />
            </list-item>
          ))}
        <list-item item-key="end">
          <text className="Title" item-key="end">
            {images.length > 0 ? 'End of the images' : 'No images found'}
          </text>
        </list-item>
      </list>
    </view>
  );
}
