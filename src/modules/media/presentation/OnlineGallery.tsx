import { useState, useEffect, useCallback } from '@lynx-js/react';
import { diContainer } from '../../../di/container.js';
import { MediaDeleteError, MediaDeleteResult } from '../domain/entities.js';
import { LoadingSpinner } from '../../shared/presentation/LoadingSpinner.js';
import type { GetAllImagesDto } from '../../shared/infrastructure/dtos/get-all-images.dto.js';

interface SelectedImage {
  id: string;
  url: string;
}

export function OnlineGallery() {
  const [images, setImages] = useState<GetAllImagesDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GetAllImagesDto | null>(
    null,
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string>('');
  const [serverUrl, setServerUrl] = useState<string>('');

  const getUserAllImagesUseCase = diContainer.getGetUserAllImagesUseCase();
  const deleteImageUseCase = diContainer.getDeleteImageUseCase();

  // Load server URL from storage
  useEffect(() => {
    try {
      const savedServerUrl =
        NativeModules.NativeLocalStorageModule.getStorageItem('serverUrl');
      if (savedServerUrl) {
        setServerUrl(savedServerUrl);
      }
    } catch (error) {
      console.error('Error loading server URL:', error);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const userImages = await getUserAllImagesUseCase.execute();
      setImages(userImages);
    } catch (err) {
      console.error('Failed to load images:', err);
      setError('Failed to load images from server');
    } finally {
      setLoading(false);
    }
  };

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
    (imageId: string, imageUrl: string) => {
      if (!selectionMode) {
        const image = images.find((img) => img.id === imageId);
        if (image) {
          setSelectedImage(image);
        }
      } else {
        toggleImageSelection(imageId, imageUrl);
      }
    },
    [selectionMode, toggleImageSelection, images],
  );

  const handleImageLongPress = useCallback(
    (imageId: string, imageUrl: string) => {
      setSelectionMode(true);
      toggleImageSelection(imageId, imageUrl);
    },
    [toggleImageSelection],
  );

  const deleteSelectedImages = useCallback(async () => {
    if (selectedImages.length === 0) return;

    setDeleting(true);
    setDeleteMessage('');

    try {
      const deletePromises = selectedImages.map((image) =>
        deleteImageUseCase.execute(image.id),
      );

      const results = await Promise.all(deletePromises);

      const errors = results.filter(
        (result) => result instanceof MediaDeleteError,
      );
      const successes = results.filter(
        (result) => result instanceof MediaDeleteResult,
      );

      if (errors.length > 0) {
        setDeleteMessage(
          `Failed to delete ${errors.length} images. Please try again.`,
        );
      } else {
        setDeleteMessage(`${successes.length} images deleted successfully!`);
        await loadImages();
      }

      setSelectedImages([]);
      setSelectionMode(false);
      setTimeout(() => setDeleteMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting images:', error);
      setDeleteMessage('Error deleting images. Please try again.');
      setTimeout(() => setDeleteMessage(''), 5000);
    } finally {
      setDeleting(false);
    }
  }, [selectedImages, deleteImageUseCase]);

  const cancelSelection = useCallback(() => {
    setSelectedImages([]);
    setSelectionMode(false);
    setDeleteMessage('');
  }, []);

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const getImageUrl = (imageId: string) => {
    return serverUrl ? `${serverUrl}/media/stream/${imageId}` : '';
  };

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
        <LoadingSpinner
          size="large"
          color="#fff"
          text="Loading online gallery..."
        />
      </view>
    );
  }

  if (error) {
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
            backgroundColor: 'rgba(220, 38, 127, 0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(220, 38, 127, 0.3)',
            textAlign: 'center',
          }}
        >
          <text
            style={{
              fontSize: '18px',
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            {error}
          </text>
          <view
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(59, 130, 246, 0.9)',
              borderRadius: '25px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              backdropFilter: 'blur(10px)',
              cursor: 'pointer',
            }}
            bindtap={loadImages}
          >
            <text
              style={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              Retry
            </text>
          </view>
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
      {deleteMessage && (
        <view
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '16px',
            backgroundColor:
              deleteMessage.includes('Failed') ||
              deleteMessage.includes('Error')
                ? 'rgba(220, 38, 127, 0.9)'
                : 'rgba(34, 197, 94, 0.9)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border:
              deleteMessage.includes('Failed') ||
              deleteMessage.includes('Error')
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
            {deleteMessage}
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
                Tap to select more, or delete selected
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
                  backgroundColor: deleting
                    ? 'rgba(220, 38, 127, 0.5)'
                    : 'rgba(220, 38, 127, 0.9)',
                  borderRadius: '25px',
                  border: '1px solid rgba(220, 38, 127, 0.3)',
                  backdropFilter: 'blur(10px)',
                  minWidth: '80px',
                }}
                bindtap={deleteSelectedImages}
              >
                <text
                  style={{
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
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
            Online Gallery
          </text>
          <text
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '20px',
              marginBottom: '16px',
            }}
          >
            {images.length} images uploaded to server • Long press to delete
          </text>
        </view>
      )}

      {/* Main Content */}
      <list
        list-type="flow"
        span-count={2}
        scroll-orientation="vertical"
        style={{
          width: '100%',
          height: '100%',
          paddingTop: selectionMode ? '100px' : '20px',
          paddingBottom: '100px', // Account for bottom navigation
        }}
      >
        {/* Image Grid */}
        {images.length > 0 ? (
          images.map((image) => {
            const isSelected = selectedImages.some(
              (selected) => selected.id === image.id,
            );

            return (
              <list-item
                style={{
                  width: '100%',
                }}
                key={image.id}
                item-key={image.id}
                className={`gallery-item ${isSelected ? 'gallery-item--selected' : 'gallery-item--normal'}`}
                bindtap={() => handleImageTap(image.id, getImageUrl(image.id))}
                bindlongpress={() =>
                  handleImageLongPress(image.id, getImageUrl(image.id))
                }
              >
                <image
                  src={getImageUrl(image.id)}
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
                      backgroundColor: 'rgba(220, 38, 127, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <view
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'rgba(220, 38, 127, 0.9)',
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
                      backgroundColor: 'rgba(220, 38, 127, 0.9)',
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
                      {selectedImages.findIndex((img) => img.id === image.id) +
                        1}
                    </text>
                  </view>
                )}
              </list-item>
            );
          })
        ) : (
          <list-item key="empty" item-key="empty" full-span={true}>
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
                No Images Uploaded
              </text>
              <text
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                Upload some images to see them here
              </text>
            </view>
          </list-item>
        )}

        {/* Footer */}
        {images.length > 0 && (
          <list-item key="footer" item-key="footer" full-span={true}>
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
                Lynx Online Gallery
              </text>
            </view>
          </list-item>
        )}
      </list>

      {/* Modal for viewing full image */}
      {selectedImage && (
        <view
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          bindtap={handleCloseModal}
        >
          <view
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
            }}
          >
            <view
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1001,
              }}
              bindtap={handleCloseModal}
            >
              <text
                style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}
              >
                ×
              </text>
            </view>
            <image
              src={getImageUrl(selectedImage.id)}
              mode="aspectFit"
              style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                maxHeight: '70vh',
              }}
            />
            <view
              style={{
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                textAlign: 'center',
              }}
            >
              <text style={{ color: '#fff', fontSize: '14px' }}>
                Image {selectedImage.id}
              </text>
            </view>
          </view>
        </view>
      )}
    </view>
  );
}
