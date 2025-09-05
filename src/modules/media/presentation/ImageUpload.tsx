import { useState, useEffect } from '@lynx-js/react';
import { useLocation, useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { MediaUploadError, MediaUploadResult } from '../domain/entities.js';
import { LoadingSpinner } from '../../shared/presentation/LoadingSpinner.js';
import { LoadingButton } from '../../shared/presentation/LoadingButton.js';
import './ImageUpload.css';

interface DeleteSuccessState {
  type: 'delete_success';
  message: string;
}

interface ImageUploadProps {
  // Modal mode props
  imageUrl?: string;
  fileName?: string;
  onClose?: () => void;
  onNavigateToOnlineGallery?: () => void;
  isModal?: boolean;
}

export function ImageUpload({
  imageUrl: propImageUrl,
  fileName: propFileName,
  onClose,
  onNavigateToOnlineGallery,
  isModal = false,
}: ImageUploadProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingUploadStatus, setCheckingUploadStatus] = useState(true);
  const [isAlreadyUploaded, setIsAlreadyUploaded] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<
    MediaUploadResult | MediaUploadError | DeleteSuccessState | null
  >(null);

  const uploadImageUseCase = diContainer.getUploadImageUseCase();
  const getUserAllImagesUseCase = diContainer.getGetUserAllImagesUseCase();
  const deleteImageUseCase = diContainer.getDeleteImageUseCase();

  // Use props if in modal mode, otherwise use location state
  const imageUrl = isModal ? propImageUrl : location.state?.imageUrl;
  const fileName = isModal ? propFileName : location.state?.fileName;

  // Check if image is already uploaded
  useEffect(() => {
    const checkUploadStatus = async () => {
      if (!fileName) {
        setCheckingUploadStatus(false);
        return;
      }

      try {
        const uploadedImages = await getUserAllImagesUseCase.execute();
        const existingImage = uploadedImages.find(
          (img) => img.original_filename === fileName,
        );

        if (existingImage) {
          setIsAlreadyUploaded(true);
          setUploadedImageId(existingImage.id);
        }
      } catch (error) {
        console.error('Error checking upload status:', error);
      } finally {
        setCheckingUploadStatus(false);
      }
    };

    checkUploadStatus();
  }, [fileName, getUserAllImagesUseCase]);

  const handleImageUpload = async () => {
    console.log('Starting image upload...');
    if (!imageUrl) {
      setUploadResult(null);
      return;
    }

    if (isAlreadyUploaded) {
      setUploadResult(
        new MediaUploadError(
          'This image is already uploaded to the server.',
          409,
        ),
      );
      return;
    }

    setLoading(true);
    setUploadResult(null);
    console.log('Loading is true');

    try {
      // Use requestAnimationFrame to ensure the loading state is rendered
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50); // Small delay to ensure UI updates
        });
      });

      const result = await uploadImageUseCase.execute(
        imageUrl,
        fileName || 'image.jpg',
        'image/jpeg',
      );

      setUploadResult(result);

      if (result instanceof MediaUploadError) {
        setUploadResult(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadResult(null);
    } finally {
      setLoading(false);
      console.log('Loading is false');
    }
  };

  const handleDeleteUploadedImage = async () => {
    if (!uploadedImageId) return;

    setLoading(true);
    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 50);
        });
      });

      const result = await deleteImageUseCase.execute(uploadedImageId);

      if ('id' in result && !('code' in result)) {
        // Success - image deleted
        setIsAlreadyUploaded(false);
        setUploadedImageId(null);
        setUploadResult({
          type: 'delete_success',
          message: 'Image deleted successfully from server',
        });
      } else {
        setUploadResult(
          new MediaUploadError(`Error deleting image: ${result.message}`, 500),
        );
      }
    } catch (error) {
      console.error('Delete error:', error);
      setUploadResult(
        new MediaUploadError('Error deleting image. Please try again.', 500),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewOnlineGallery = () => {
    if (isModal && onNavigateToOnlineGallery) {
      onNavigateToOnlineGallery();
    } else {
      navigate('/online-gallery');
    }
  };

  const handleBackToGallery = () => {
    if (isModal && onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (!imageUrl) {
    return (
      <view className="image-upload-container">
        <view className="image-upload-header">
          <text className="image-upload-title">Upload Image</text>
          {isModal ? (
            <view
              className="image-upload-nav-button"
              bindtap={handleBackToGallery}
            >
              <text>✕ Close</text>
            </view>
          ) : (
            <view
              className="image-upload-nav-button"
              bindtap={handleBackToGallery}
            >
              <text>← Back to Gallery</text>
            </view>
          )}
        </view>
        <view className="image-upload-empty">
          <text>No image selected for upload</text>
          <text className="image-upload-empty-subtitle">
            Please select an image from the gallery first
          </text>
        </view>
      </view>
    );
  }

  console.log(
    'Rendering with uplading status and result:',
    loading,
    uploadResult,
  );

  return (
    <view className="image-upload-container">
      <view className="image-upload-header">
        <text className="image-upload-title">Upload Image</text>
        {isModal ? (
          <view
            className="image-upload-nav-button"
            bindtap={handleBackToGallery}
          >
            <text>✕ Close</text>
          </view>
        ) : (
          <view
            className="image-upload-nav-button"
            bindtap={handleBackToGallery}
          >
            <text>← Back to Gallery</text>
          </view>
        )}
      </view>

      <view className="image-upload-content">
        <view className="image-upload-preview">
          {!loading && !checkingUploadStatus && (
            <image
              src={imageUrl}
              auto-size={true}
              mode="aspectFit"
              placeholder="Loading image..."
              className="image-upload-image"
              style={{ opacity: loading ? 0.7 : 1 }}
            />
          )}
          {(loading || checkingUploadStatus) && (
            <LoadingSpinner
              overlay={true}
              text={
                checkingUploadStatus
                  ? 'Checking upload status...'
                  : 'Uploading to server...'
              }
              color="#3b82f6"
            />
          )}
        </view>

        <view className="image-upload-actions">
          {!uploadResult && !checkingUploadStatus && !isAlreadyUploaded && (
            <LoadingButton
              text="Upload to Server"
              loadingText="Uploading..."
              loading={loading}
              onTap={handleImageUpload}
              className="image-upload-button"
            />
          )}

          {!uploadResult && !checkingUploadStatus && isAlreadyUploaded && (
            <view className="image-upload-already-uploaded">
              <text className="image-upload-error-title">Already Uploaded</text>
              <text className="image-upload-error-message">
                This image is already uploaded to the server
              </text>
              <view className="image-upload-actions-row">
                <LoadingButton
                  text="Delete from Server"
                  loadingText="Deleting..."
                  loading={loading}
                  onTap={handleDeleteUploadedImage}
                  variant="danger"
                  className="image-upload-button"
                />
                <view
                  className="image-upload-button secondary"
                  bindtap={handleBackToGallery}
                >
                  <text>{isModal ? 'Close' : 'Back to Gallery'}</text>
                </view>
              </view>
            </view>
          )}

          {uploadResult instanceof MediaUploadResult && (
            <view className="image-upload-success">
              <text className="image-upload-success-title">
                Upload Successful!
              </text>
              <text className="image-upload-success-subtitle">
                Your image has been uploaded to the server
              </text>
              <view className="image-upload-actions-row">
                <view
                  className="image-upload-button secondary"
                  bindtap={handleBackToGallery}
                >
                  <text>{isModal ? 'Upload Another' : 'Upload Another'}</text>
                </view>
                <view
                  className="image-upload-button primary"
                  bindtap={handleViewOnlineGallery}
                >
                  <text>View Online Gallery</text>
                </view>
              </view>
            </view>
          )}

          {uploadResult &&
            'type' in uploadResult &&
            uploadResult.type === 'delete_success' && (
              <view className="image-upload-success">
                <text className="image-upload-success-title">
                  Delete Successful!
                </text>
                <text className="image-upload-success-subtitle">
                  {uploadResult.message}
                </text>
                <view className="image-upload-actions-row">
                  <LoadingButton
                    text="Upload to Server"
                    loadingText="Uploading..."
                    loading={loading}
                    onTap={handleImageUpload}
                    className="image-upload-button"
                  />
                  <view
                    className="image-upload-button secondary"
                    bindtap={handleBackToGallery}
                  >
                    <text>{isModal ? 'Close' : 'Back to Gallery'}</text>
                  </view>
                </view>
              </view>
            )}

          {uploadResult instanceof MediaUploadError && (
            <view className="image-upload-error">
              <text className="image-upload-error-title">Upload Failed</text>
              <text className="image-upload-error-message">
                {uploadResult.message}
              </text>
              <view className="image-upload-button" bindtap={handleImageUpload}>
                <text>Try Again</text>
              </view>
            </view>
          )}
        </view>
      </view>
    </view>
  );
}
