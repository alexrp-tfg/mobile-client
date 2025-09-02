import { useCallback, useEffect, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import type { Gallery } from '../domain/entities.js';

interface SelectedImage {
  id: string;
  url: string;
}

export function ImageSelector() {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const nav = useNavigate();

  useEffect(() => {
    const getGalleryImagesUseCase = diContainer.getGetGalleryImagesUseCase();

    const loadGallery = async () => {
      setLoading(true);
      try {
        const galleryResult = await getGalleryImagesUseCase.execute(10);
        setGallery(galleryResult);
      } catch (error) {
        console.error('Error loading gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const toggleImageSelection = useCallback(
    (imageId: string, imageUrl: string) => {
      setSelectedImages((prev) => {
        const isSelected = prev.some((img) => img.id === imageId);
        if (isSelected) {
          const newSelection = prev.filter((img) => img.id !== imageId);
          if (newSelection.length === 0) {
            setSelectionMode(false);
          }
          return newSelection;
        } else {
          return [...prev, { id: imageId, url: imageUrl }];
        }
      });
    },
    [],
  );

  const handleImageTap = useCallback(
    (imageUrl: string, imageId: string) => {
      if (!selectionMode) {
        nav('/upload', { state: { imageUrl } });
      } else {
        toggleImageSelection(imageId, imageUrl);
      }
    },
    [nav, selectionMode, toggleImageSelection],
  );

  const handleImageLongPress = useCallback(
    (imageId: string, imageUrl: string) => {
      setSelectionMode(true);
      toggleImageSelection(imageId, imageUrl);
    },
    [toggleImageSelection],
  );

  const uploadSelectedImages = useCallback(async () => {
    if (selectedImages.length === 0) return;

    setUploading(true);
    setUploadMessage('');
    const uploadImageUseCase = diContainer.getUploadImageUseCase();

    try {
      const uploadPromises = selectedImages.map((image, index) =>
        uploadImageUseCase.execute(
          image.url,
          `selected_image_${index + 1}.jpg`,
          'image/jpeg',
        ),
      );

      await Promise.all(uploadPromises);

      setSelectedImages([]);
      setSelectionMode(false);
      setUploadMessage('Images uploaded successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadMessage('Error uploading images. Please try again.');

      // Clear error message after 5 seconds
      setTimeout(() => setUploadMessage(''), 5000);
    } finally {
      setUploading(false);
    }
  }, [selectedImages]);

  const cancelSelection = useCallback(() => {
    setSelectedImages([]);
    setSelectionMode(false);
    setUploadMessage('');
  }, []);

  if (loading) {
    return (
      <view style={{ width: '100%', height: '100%', padding: '20px' }}>
        <text>Loading images...</text>
      </view>
    );
  }

  const images = gallery?.images || [];

  return (
    <view style={{ width: '100%', height: '100%' }}>
      {uploadMessage && (
        <view
          style={{
            padding: '10px',
            backgroundColor: uploadMessage.includes('Error')
              ? '#f8d7da'
              : '#d4edda',
            borderBottom: '1px solid #ddd',
            textAlign: 'center',
          }}
        >
          <text
            style={{
              color: uploadMessage.includes('Error') ? '#721c24' : '#155724',
              fontSize: '14px',
            }}
          >
            {uploadMessage}
          </text>
        </view>
      )}

      {selectionMode && (
        <view
          style={{
            padding: '10px',
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <text style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {selectedImages.length} selected
          </text>
          <view style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <view
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                borderRadius: '4px',
                opacity: uploading ? 0.6 : 1,
              }}
              bindtap={uploadSelectedImages}
            >
              <text style={{ color: 'white' }}>
                {uploading ? 'Uploading...' : 'Upload'}
              </text>
            </view>
            <view
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                borderRadius: '4px',
              }}
              bindtap={cancelSelection}
            >
              <text style={{ color: 'white' }}>Cancel</text>
            </view>
          </view>
        </view>
      )}

      <list
        list-type="flow"
        column-count={2}
        scroll-orientation="vertical"
        style={{
          width: '100%',
          height: uploadMessage || selectionMode ? 'calc(100% - 60px)' : '100%',
        }}
      >
        <list-item item-key="header">
          <text
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            {selectionMode
              ? 'Select images to upload'
              : 'Tap to upload, long press to select'}
          </text>
        </list-item>

        {images.length > 0 &&
          images.map((image) => {
            const isSelected = selectedImages.some(
              (selected) => selected.id === image.id,
            );

            return (
              <list-item
                item-key={image.id}
                key={image.id}
                style={{
                  width: '100%',
                  border: isSelected ? '3px solid #007bff' : '1px solid #ddd',
                  position: 'relative',
                }}
              >
                <view
                  style={{ position: 'relative' }}
                  bindtap={() => handleImageTap(image.url, image.id)}
                  bindlongpress={() =>
                    handleImageLongPress(image.id, image.url)
                  }
                >
                  <image
                    src={image.url}
                    placeholder="Loading image..."
                    auto-size={true}
                    mode="aspectFill"
                    style={{
                      opacity: isSelected ? 0.8 : 1,
                      filter: isSelected ? 'brightness(0.9)' : 'none',
                    }}
                  />
                  {isSelected && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#007bff',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <text
                        style={{
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        ✓
                      </text>
                    </view>
                  )}
                </view>
              </list-item>
            );
          })}

        <list-item item-key="footer">
          <text
            style={{
              padding: '16px',
              textAlign: 'center',
              color: '#666',
            }}
          >
            {images.length > 0 ? 'End of images' : 'No images found'}
          </text>
        </list-item>
      </list>
    </view>
  );
}
