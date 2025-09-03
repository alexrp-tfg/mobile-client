import { useState } from '@lynx-js/react';
import { useLocation, useNavigate } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { MediaUploadError, MediaUploadResult } from '../domain/entities.js';
import { LoadingSpinner } from '../../../components/LoadingSpinner.js';
import { LoadingButton } from '../../../components/LoadingButton.js';
import './ImageUpload.css';

export function ImageUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<
    MediaUploadResult | MediaUploadError | null
  >(null);

  const uploadImageUseCase = diContainer.getUploadImageUseCase();
  const imageUrl = location.state?.imageUrl;
  const fileName = location.state?.fileName;

  const handleImageUpload = async () => {
    console.log('Starting image upload...');
    if (!imageUrl) {
      setUploadResult(null);
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

  const handleViewOnlineGallery = () => {
    navigate('/online-gallery');
  };

  const handleBackToGallery = () => {
    navigate(-1);
  };

  if (!imageUrl) {
    return (
      <view className="image-upload-container">
        <view className="image-upload-header">
          <text className="image-upload-title">Upload Image</text>
          <view
            className="image-upload-nav-button"
            bindtap={handleBackToGallery}
          >
            <text>← Back to Gallery</text>
          </view>
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
        <view className="image-upload-nav-button" bindtap={handleBackToGallery}>
          <text>← Back to Gallery</text>
        </view>
      </view>

      <view className="image-upload-content">
        <view className="image-upload-preview">
          {!loading && (
            <image
              src={imageUrl}
              auto-size={true}
              mode="aspectFit"
              placeholder="Loading image..."
              className="image-upload-image"
              style={{ opacity: loading ? 0.7 : 1 }}
            />
          )}
          {loading && (
            <LoadingSpinner
              overlay={true}
              text="Uploading to server..."
              color="#007bff"
            />
          )}
        </view>

        <view className="image-upload-actions">
          {!uploadResult && (
            <LoadingButton
              text="Upload to Server"
              loadingText="Uploading..."
              loading={loading}
              onTap={handleImageUpload}
              className="image-upload-button"
            />
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
                  <text>Upload Another</text>
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
