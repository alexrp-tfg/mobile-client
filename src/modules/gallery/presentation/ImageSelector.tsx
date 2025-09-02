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
        const galleryResult = await getGalleryImagesUseCase.execute(15);
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
      setUploadMessage(
        `${uploadPromises.length} images uploaded successfully!`,
      );

      setTimeout(() => setUploadMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadMessage('Error uploading images. Please try again.');
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

  const images = gallery?.images || [];

  if (loading) {
    return (
      <view
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
        }}
      >
        <view
          style={{
            padding: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <text
            style={{
              fontSize: '18px',
              color: '#fff',
              textAlign: 'center',
            }}
          >
            Loading gallery...
          </text>
        </view>
      </view>
    );
  }

  return (
    <view
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        position: 'relative',
      }}
    >
      {/* Status Message */}
      {uploadMessage && (
        <view
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '16px',
            backgroundColor: uploadMessage.includes('Error')
              ? 'rgba(220, 38, 127, 0.9)'
              : 'rgba(34, 197, 94, 0.9)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: uploadMessage.includes('Error')
              ? '1px solid rgba(220, 38, 127, 0.3)'
              : '1px solid rgba(34, 197, 94, 0.3)',
          }}
        >
          <text
            style={{
              color: '#fff',
              fontSize: '14px',
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            {uploadMessage}
          </text>
        </view>
      )}

      {/* Selection Header */}
      {selectionMode && (
        <view
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            zIndex: 999,
            padding: '16px 20px',
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <view
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <view style={{ flex: 1 }}>
              <text
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '4px',
                }}
              >
                {selectedImages.length} Selected
              </text>
              <text
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Tap to select more, or upload now
              </text>
            </view>

            <view
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
              }}
            >
              <view
                style={{
                  padding: '12px 20px',
                  backgroundColor: uploading
                    ? 'rgba(59, 130, 246, 0.5)'
                    : 'rgba(59, 130, 246, 0.9)',
                  borderRadius: '25px',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '80px',
                }}
                bindtap={uploadSelectedImages}
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </text>
              </view>

              <view
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'rgba(107, 114, 128, 0.9)',
                  borderRadius: '25px',
                  border: '1px solid rgba(107, 114, 128, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
                bindtap={cancelSelection}
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </text>
              </view>
            </view>
          </view>
        </view>
      )}

      {/* Main Content */}
      <scroll-view
        scroll-orientation="vertical"
        style={{
          width: '100%',
          height: '100%',
          paddingTop: selectionMode ? '100px' : '20px',
          paddingBottom: '20px',
        }}
      >
        {/* Header */}
        {!selectionMode && (
          <view
            style={{
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <text
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              Photo Gallery
            </text>
            <text
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '20px',
              }}
            >
              Tap to upload • Long press to select multiple
            </text>
          </view>
        )}

        {/* Image Grid */}
        {images.length > 0 ? (
          <view className="gallery-grid">
            {images.map((image) => {
              const isSelected = selectedImages.some(
                (selected) => selected.id === image.id,
              );

              return (
                <view
                  key={image.id}
                  className={`gallery-item ${isSelected ? 'gallery-item--selected' : 'gallery-item--normal'}`}
                  bindtap={() => handleImageTap(image.url, image.id)}
                  bindlongpress={() =>
                    handleImageLongPress(image.id, image.url)
                  }
                >
                  <image
                    src={image.url}
                    placeholder="Loading..."
                    mode="aspectFill"
                    style={{
                      width: '100%',
                      height: '100%',
                      opacity: isSelected ? 0.7 : 1,
                      transition: 'opacity 0.2s ease',
                    }}
                  />

                  {/* Selection Overlay */}
                  {isSelected && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <view
                        style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: 'rgba(59, 130, 246, 0.9)',
                          borderRadius: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #fff',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <text
                          style={{
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: '700',
                          }}
                        >
                          ✓
                        </text>
                      </view>
                    </view>
                  )}

                  {/* Selection Badge */}
                  {isSelected && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #fff',
                      }}
                    >
                      <text
                        style={{
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        {selectedImages.findIndex(
                          (img) => img.id === image.id,
                        ) + 1}
                      </text>
                    </view>
                  )}
                </view>
              );
            })}
          </view>
        ) : (
          <view
            style={{
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <text
              style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
              }}
            >
              No Images Found
            </text>
            <text
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              Your photo gallery appears to be empty
            </text>
          </view>
        )}

        {/* Footer */}
        {images.length > 0 && (
          <view
            style={{
              padding: '40px 20px 20px',
              textAlign: 'center',
            }}
          >
            <text
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              {images.length} photos • Lynx Gallery
            </text>
          </view>
        )}
      </scroll-view>
    </view>
  );
}
