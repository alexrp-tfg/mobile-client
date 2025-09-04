import { useCallback, useEffect, useState } from '@lynx-js/react';
import { useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { LoadingSpinner } from '../../shared/presentation/LoadingSpinner.js';
import { LoadingButton } from '../../shared/presentation/LoadingButton.js';
import { RefreshButton } from '../../shared/presentation/RefreshButton.js';
import { StatusMessage } from '../../shared/presentation/StatusMessage.js';
import { ServerStatus } from '../../shared/presentation/ServerStatus.js';
import { useStatusMessage } from '../../shared/presentation/useStatusMessage.js';
import type { Gallery } from '../domain/entities.js';
import type { GalleryImageWithUploadStatus } from '../application/use-cases/GetUploadedFilesStatusUseCase.js';
import type { UploadImageUseCase } from '../../media/application/use-cases/UploadImageUseCase.js';

interface SelectedImage {
  id: string;
  url: string;
  fileName?: string;
  isUploaded?: boolean;
  uploadedImageId?: string;
}

interface UploadProgress {
  [imageId: string]: 'uploading' | 'success' | 'error';
}

export function ImageSelector() {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [imagesWithUploadStatus, setImagesWithUploadStatus] = useState<
    GalleryImageWithUploadStatus[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [autoUploading, setAutoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [serverUrl, setServerUrl] = useState<string>('');
  const {
    message: uploadMessage,
    showMessage: setUploadMessage,
    clearMessage: clearUploadMessage,
  } = useStatusMessage();
  const nav = useNavigate();

  // Helper function to get upload settings
  const getUploadSettings = useCallback(() => {
    try {
      const savedSettings =
        NativeModules.NativeLocalStorageModule.getStorageItem('uploadSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return {
          maxParallelUploads: parsed.maxParallelUploads || 3,
          autoUpload: parsed.autoUpload || false,
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    return { maxParallelUploads: 3, autoUpload: false };
  }, []);

  // Helper function to process uploads with limited concurrency
  const processUploadsWithLimit = useCallback(
    async (
      images: SelectedImage[],
      maxConcurrent: number,
      uploadImageUseCase: UploadImageUseCase,
      onProgress: (imageId: string, status: 'success' | 'error') => void,
    ) => {
      let successCount = 0;
      let failCount = 0;
      let currentIndex = 0;

      const processImage = async (
        image: SelectedImage,
        imageIndex: number,
      ): Promise<void> => {
        try {
          // Get file extension from URL if possible
          const urlParts = image.fileName?.split('.') ?? image.url.split('.');
          const extension = urlParts.length > 1 ? urlParts.pop() : 'jpg';
          const result = await uploadImageUseCase.execute(
            image.url,
            image.fileName || `selected_image_${imageIndex + 1}.jpg`,
            'image/' + extension,
          );

          // Check if result is an error (MediaUploadError has 'code' property)
          if ('code' in result) {
            console.error(
              `Upload failed for image ${image.id}:`,
              result.message,
            );
            onProgress(image.id, 'error');
            failCount++;
          } else {
            // Success case (MediaUploadResult)
            console.log(`Upload succeeded for image ${image.id}`);
            onProgress(image.id, 'success');
            successCount++;
          }
        } catch (error) {
          console.error(`Error uploading image ${image.id}:`, error);
          onProgress(image.id, 'error');
          failCount++;
        }
      };

      const processNext = async (): Promise<void> => {
        while (currentIndex < images.length) {
          const imageIndex = currentIndex++;
          const image = images[imageIndex];

          if (image) {
            await processImage(image, imageIndex);
          }
        }
      };

      // Start exactly maxConcurrent workers
      const workers = Array.from(
        { length: Math.min(maxConcurrent, images.length) },
        () => processNext(),
      );

      await Promise.all(workers);

      return { successCount, failCount };
    },
    [],
  );

  // Auto upload function for background uploads - completely non-blocking
  const triggerAutoUpload = useCallback(
    async (autoUploadImages: SelectedImage[]) => {
      if (autoUploadImages.length === 0) return;

      console.log(
        `Starting background auto upload for ${autoUploadImages.length} images`,
      );

      // Set auto upload state without affecting main UI
      setAutoUploading(true);

      // Use setTimeout to ensure this runs after the main UI has updated
      setTimeout(async () => {
        try {
          const settings = getUploadSettings();
          const uploadImageUseCase = diContainer.getUploadImageUseCase();

          // Process uploads with parallel limit - don't block UI
          const { successCount, failCount } = await processUploadsWithLimit(
            autoUploadImages,
            Math.min(settings.maxParallelUploads, 2), // Limit auto upload concurrency for better performance
            uploadImageUseCase,
            (imageId: string, status: 'success' | 'error') => {
              // Update the images with upload status immediately for success
              if (status === 'success') {
                setImagesWithUploadStatus((prevImages) =>
                  prevImages.map((img) =>
                    img.id === imageId ? { ...img, isUploaded: true } : img,
                  ),
                );
              }
            },
          );

          // Only show subtle completion message for auto upload
          if (successCount > 0) {
            console.log(
              `Auto upload completed: ${successCount} images uploaded successfully${failCount > 0 ? `, ${failCount} failed` : ''}`,
            );
          }
        } catch (error) {
          console.error('Error during auto upload:', error);
        } finally {
          setAutoUploading(false);
        }
      }, 100); // Small delay to let UI settle
    },
    [getUploadSettings, processUploadsWithLimit],
  );

  const loadGallery = useCallback(async () => {
    const getGalleryImagesUseCase = diContainer.getGetGalleryImagesUseCase();
    const getUploadedFilesStatusUseCase =
      diContainer.getGetUploadedFilesStatusUseCase();

    setLoading(true);
    try {
      const galleryResult = await getGalleryImagesUseCase.execute(15);
      setGallery(galleryResult);

      // Check upload status for all images
      const imagesWithStatus = await getUploadedFilesStatusUseCase.execute(
        galleryResult.images,
      );
      setImagesWithUploadStatus(imagesWithStatus);
      console.log('Loaded gallery with images:', imagesWithStatus);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Separate effect for auto upload to avoid blocking gallery loading
  useEffect(() => {
    // Only run auto upload after gallery has loaded and we have images
    if (!loading && imagesWithUploadStatus.length > 0) {
      const settings = getUploadSettings();
      if (
        settings.autoUpload &&
        !selectionMode &&
        !uploading &&
        !autoUploading
      ) {
        const nonUploadedImages = imagesWithUploadStatus.filter(
          (img) => !img.isUploaded,
        );
        if (nonUploadedImages.length > 0) {
          console.log(
            `Auto upload enabled: Found ${nonUploadedImages.length} images to upload`,
          );

          // Convert to SelectedImage format for auto upload
          const autoUploadImages: SelectedImage[] = nonUploadedImages.map(
            (img) => ({
              id: img.id,
              url: img.url,
              fileName: img.metadata?.name,
              isUploaded: false,
            }),
          );

          // Trigger auto upload in background - completely non-blocking
          triggerAutoUpload(autoUploadImages);
        }
      }
    }
  }, [
    loading,
    imagesWithUploadStatus,
    selectionMode,
    uploading,
    autoUploading,
    getUploadSettings,
    triggerAutoUpload,
  ]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

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

  const toggleImageSelection = useCallback(
    (
      imageId: string,
      imageUrl: string,
      fileName?: string,
      isUploaded?: boolean,
      uploadedImageId?: string,
    ) => {
      setSelectedImages((prev) => {
        const isSelected = prev.some((img) => img.id === imageId);
        if (isSelected) {
          const newSelection = prev.filter((img) => img.id !== imageId);
          if (newSelection.length === 0) {
            setSelectionMode(false);
          }
          return newSelection;
        } else {
          return [
            ...prev,
            {
              id: imageId,
              url: imageUrl,
              fileName,
              isUploaded,
              uploadedImageId,
            },
          ];
        }
      });
    },
    [],
  );

  const handleImageTap = useCallback(
    (
      imageUrl: string,
      imageId: string,
      fileName?: string,
      isUploaded?: boolean,
      uploadedImageId?: string,
    ) => {
      if (!selectionMode) {
        if (isUploaded) {
          // For uploaded images, show a message
          setUploadMessage(
            'This image is already uploaded. Long press to delete from server.',
          );
        } else {
          // For non-uploaded images, navigate to upload
          nav('/upload', { state: { imageUrl, fileName } });
        }
      } else {
        // In selection mode, check what type of images are selected
        console.log(
          'In selection mode, selectedImages.length:',
          selectedImages.length,
        );
        console.log(
          'Current selectedImages:',
          selectedImages.map((img) => ({
            id: img.id,
            isUploaded: img.isUploaded,
          })),
        );
        console.log(
          'Trying to select image:',
          imageId,
          'isUploaded:',
          isUploaded,
        );

        if (selectedImages.length > 0) {
          const firstSelectedIsUploaded = selectedImages[0].isUploaded;
          console.log('First selected is uploaded:', firstSelectedIsUploaded);

          if (firstSelectedIsUploaded && isUploaded) {
            // In delete mode - only allow selecting uploaded images
            console.log('Adding to delete selection');
            toggleImageSelection(
              imageId,
              imageUrl,
              fileName,
              isUploaded,
              uploadedImageId,
            );
          } else if (!firstSelectedIsUploaded && !isUploaded) {
            // In upload mode - only allow selecting non-uploaded images
            console.log('Adding to upload selection');
            toggleImageSelection(
              imageId,
              imageUrl,
              fileName,
              isUploaded,
              uploadedImageId,
            );
          } else {
            console.log('Ignoring tap - incompatible image type');
          }
          // Ignore taps on incompatible image types
        } else {
          // First selection determines the mode
          console.log('First selection, determining mode');
          toggleImageSelection(
            imageId,
            imageUrl,
            fileName,
            isUploaded,
            uploadedImageId,
          );
        }
      }
    },
    [nav, selectionMode, selectedImages, toggleImageSelection],
  );

  const handleImageLongPress = useCallback(
    (
      imageId: string,
      imageUrl: string,
      fileName?: string,
      isUploaded?: boolean,
      uploadedImageId?: string,
    ) => {
      if (isUploaded && uploadedImageId) {
        // For uploaded images, enter selection mode for deletion
        setSelectionMode(true);
        toggleImageSelection(
          imageId,
          imageUrl,
          fileName,
          isUploaded,
          uploadedImageId,
        );
      } else {
        // For non-uploaded images, enter selection mode for upload
        setSelectionMode(true);
        toggleImageSelection(imageId, imageUrl, fileName);
      }
    },
    [toggleImageSelection],
  );

  const deleteSelectedImages = useCallback(async () => {
    const uploadedImages = selectedImages.filter(
      (img) => img.isUploaded && img.uploadedImageId,
    );

    console.log('Selected images for deletion:', uploadedImages.length);
    console.log(
      'Uploaded image IDs:',
      uploadedImages.map((img) => img.uploadedImageId),
    );

    if (uploadedImages.length === 0) {
      setUploadMessage('No uploaded images selected for deletion.');
      return;
    }

    setUploading(true);
    const deleteImageUseCase = diContainer.getDeleteImageUseCase();

    try {
      // Use requestAnimationFrame to ensure the loading state is rendered
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50);
        });
      });

      console.log('Starting bulk delete of', uploadedImages.length, 'images');

      // Process deletions sequentially to avoid potential race conditions
      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        console.log(
          `Deleting image ${i + 1}/${uploadedImages.length}: ${image.uploadedImageId}`,
        );

        try {
          const result = await deleteImageUseCase.execute(
            image.uploadedImageId!,
          );
          results.push(result);

          if ('code' in result) {
            console.log(
              `Delete failed for image ${image.uploadedImageId}:`,
              result,
            );
            failCount++;
          } else {
            console.log(`Delete succeeded for image ${image.uploadedImageId}`);
            successCount++;
          }
        } catch (error) {
          console.error(
            `Error deleting image ${image.uploadedImageId}:`,
            error,
          );
          results.push({ code: 'ERROR', message: 'Delete failed' });
          failCount++;
        }
      }

      console.log(
        `Bulk delete completed: ${successCount} success, ${failCount} failed`,
      );

      if (failCount === 0) {
        // All deletes successful - reload gallery status
        const getGalleryImagesUseCase =
          diContainer.getGetGalleryImagesUseCase();
        const getUploadedFilesStatusUseCase =
          diContainer.getGetUploadedFilesStatusUseCase();

        const galleryResult = await getGalleryImagesUseCase.execute(15);
        setGallery(galleryResult);

        const imagesWithStatus = await getUploadedFilesStatusUseCase.execute(
          galleryResult.images,
        );
        setImagesWithUploadStatus(imagesWithStatus);

        setSelectedImages([]);
        setSelectionMode(false);
        setUploadMessage(
          `${successCount} images deleted from server successfully!`,
        );
      } else {
        setUploadMessage(
          `${failCount} images failed to delete. ${successCount} deleted successfully.`,
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting images:', error);
      setUploadMessage('Error deleting images. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  }, [selectedImages]);

  const uploadSelectedImages = useCallback(async () => {
    // Prevent manual upload if auto upload is in progress
    if (autoUploading) {
      setUploadMessage('Auto upload in progress. Please wait and try again.');
      return;
    }

    const nonUploadedImages = selectedImages.filter((img) => !img.isUploaded);
    if (nonUploadedImages.length === 0) {
      setUploadMessage(
        'No new images to upload. Selected images are already uploaded.',
      );
      return;
    }

    setUploading(true);

    // Get upload settings
    const settings = getUploadSettings();

    // Initialize upload progress for all images
    const initialProgress: UploadProgress = {};
    nonUploadedImages.forEach((image) => {
      initialProgress[image.id] = 'uploading';
    });
    setUploadProgress(initialProgress);

    const uploadImageUseCase = diContainer.getUploadImageUseCase();

    try {
      // Use requestAnimationFrame to ensure the loading state is rendered
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50); // Small delay to ensure UI updates
        });
      });

      // Process uploads with parallel limit
      const { successCount, failCount } = await processUploadsWithLimit(
        nonUploadedImages,
        settings.maxParallelUploads,
        uploadImageUseCase,
        (imageId: string, status: 'success' | 'error') => {
          // Update progress for individual image
          setUploadProgress((prev) => ({
            ...prev,
            [imageId]: status,
          }));

          // Update the images with upload status immediately for success
          if (status === 'success') {
            setImagesWithUploadStatus((prevImages) =>
              prevImages.map((img) =>
                img.id === imageId ? { ...img, isUploaded: true } : img,
              ),
            );
          }
        },
      );

      // Clear upload progress after a brief delay
      setTimeout(() => {
        setUploadProgress({});
      }, 2000);

      // Reload gallery to ensure full sync with server
      const getGalleryImagesUseCase = diContainer.getGetGalleryImagesUseCase();
      const getUploadedFilesStatusUseCase =
        diContainer.getGetUploadedFilesStatusUseCase();

      const galleryResult = await getGalleryImagesUseCase.execute(15);
      setGallery(galleryResult);

      const imagesWithStatus = await getUploadedFilesStatusUseCase.execute(
        galleryResult.images,
      );
      setImagesWithUploadStatus(imagesWithStatus);

      setSelectedImages([]);
      setSelectionMode(false);

      if (failCount === 0) {
        setUploadMessage(
          `${successCount} images uploaded successfully! (Max ${settings.maxParallelUploads} parallel)`,
        );
      } else {
        setUploadMessage(
          `${successCount} uploaded, ${failCount} failed. Please try again for failed images.`,
          'error',
        );
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadMessage('Error uploading images. Please try again.', 'error');
      setUploadProgress({});
    } finally {
      setUploading(false);
    }
  }, [
    selectedImages,
    getUploadSettings,
    processUploadsWithLimit,
    autoUploading,
  ]);

  const cancelSelection = useCallback(() => {
    setSelectedImages([]);
    setSelectionMode(false);
    clearUploadMessage();
  }, [clearUploadMessage]);

  const images =
    imagesWithUploadStatus.length > 0
      ? imagesWithUploadStatus
      : gallery?.images || [];

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
      <StatusMessage
        message={uploadMessage}
        type={uploadMessage.includes('Error') ? 'error' : 'success'}
        onHide={clearUploadMessage}
      />

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
                {selectedImages.length > 0 && selectedImages[0].isUploaded
                  ? 'Selected for deletion from server'
                  : 'Tap to select more, or upload now'}
              </text>
            </view>

            <view
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
              }}
            >
              {selectedImages.length > 0 && selectedImages[0].isUploaded ? (
                <LoadingButton
                  text="Delete"
                  loadingText="Deleting..."
                  loading={uploading}
                  onTap={deleteSelectedImages}
                  variant="danger"
                />
              ) : (
                <LoadingButton
                  text="Upload"
                  loadingText="Uploading..."
                  loading={uploading}
                  onTap={uploadSelectedImages}
                  variant="primary"
                />
              )}

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
          paddingBottom: '100px', // Account for bottom navigation
        }}
      >
        {/* Header */}
        {!selectionMode && (
          <view
            style={{
              padding: '20px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Refresh Button - Top Right */}
            <view
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 10,
              }}
            >
              <RefreshButton onRefresh={loadGallery} disabled={loading} />
            </view>

            <text
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '8px',
              }}
            >
              Local Gallery
            </text>
            <text
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '20px',
                marginBottom: '16px',
              }}
            >
              {images.length} images • Tap to upload • Long press to select
              multiple
            </text>

            {/* Server Status */}
            {serverUrl && (
              <view style={{ marginBottom: '16px' }}>
                <ServerStatus serverUrl={serverUrl} compact={true} />
              </view>
            )}
          </view>
        )}

        {/* Image Grid */}
        {images.length > 0 ? (
          <view className="gallery-grid">
            {images.map((image) => {
              const isSelected = selectedImages.some(
                (selected) => selected.id === image.id,
              );
              const imageWithStatus = image as GalleryImageWithUploadStatus;

              return (
                <view
                  key={image.id}
                  className={`gallery-item ${isSelected ? 'gallery-item--selected' : 'gallery-item--normal'}`}
                  bindtap={() =>
                    handleImageTap(
                      image.url,
                      image.id,
                      image.metadata?.name,
                      imageWithStatus.isUploaded,
                      imageWithStatus.uploadedImageId,
                    )
                  }
                  bindlongpress={() =>
                    handleImageLongPress(
                      image.id,
                      image.url,
                      image.metadata?.name,
                      imageWithStatus.isUploaded,
                      imageWithStatus.uploadedImageId,
                    )
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

                  {/* Upload Status Indicator */}
                  {(image as GalleryImageWithUploadStatus).isUploaded && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(34, 197, 94, 0.9)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <text
                        style={{
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        ✓ Uploaded
                      </text>
                    </view>
                  )}

                  {/* Real-time Upload Progress Indicator */}
                  {uploadProgress[image.id] === 'uploading' && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <text
                        style={{
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        ⏳ Uploading...
                      </text>
                    </view>
                  )}

                  {/* Upload Success Indicator */}
                  {uploadProgress[image.id] === 'success' && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(34, 197, 94, 0.9)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <text
                        style={{
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        ✅ Success!
                      </text>
                    </view>
                  )}

                  {/* Upload Error Indicator */}
                  {uploadProgress[image.id] === 'error' && (
                    <view
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        padding: '4px 8px',
                        backgroundColor: 'rgba(220, 38, 127, 0.9)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(220, 38, 127, 0.3)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <text
                        style={{
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '600',
                        }}
                      >
                        ❌ Failed
                      </text>
                    </view>
                  )}

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
              Lynx Local Gallery
            </text>
          </view>
        )}
      </scroll-view>
    </view>
  );
}
