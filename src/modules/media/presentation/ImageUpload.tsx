import { useState } from '@lynx-js/react';
import { useLocation } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { MediaUploadResult } from '../domain/entities.js';

export function ImageUpload() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<MediaUploadResult | null>(
    null,
  );

  const uploadImageUseCase = diContainer.getUploadImageUseCase();
  const imageUrl = location.state?.imageUrl;

  const handleImageUpload = async () => {
    if (!imageUrl) {
      setUploadResult(
        new MediaUploadResult(false, undefined, 'No image URL provided'),
      );
      return;
    }

    setLoading(true);
    setUploadResult(null);

    try {
      const result = await uploadImageUseCase.execute(
        imageUrl,
        'image.jpg',
        'image/jpeg',
      );
      setUploadResult(result);
    } catch (err) {
      setUploadResult(
        new MediaUploadResult(
          false,
          undefined,
          err instanceof Error ? err.message : 'An unexpected error occurred',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!imageUrl) {
    return (
      <view style={{ width: '100%', height: '100%', padding: '20px' }}>
        <text>No image selected for upload</text>
      </view>
    );
  }

  return (
    <view
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <view
        style={{
          width: '100%',
          height: '25%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!loading && (
          <image
            src={imageUrl}
            auto-size={true}
            mode="aspectFit"
            placeholder="Loading image..."
            bindtap={handleImageUpload}
          />
        )}
        {loading && (
          <view style={{ padding: '20px', textAlign: 'center' }}>
            <text>Uploading...</text>
          </view>
        )}
      </view>
      <view className="flex flex-col">
        <input
          className="input-box"
          text-color="#000000"
          placeholder={
            uploadResult?.success
              ? 'Upload successful!'
              : uploadResult?.error
                ? uploadResult.error
                : 'Tap image to upload to server'
          }
          value={
            uploadResult?.success
              ? 'Upload successful!'
              : uploadResult?.error || 'Tap image to upload to server'
          }
          style={{
            height: '100px',
            paddingLeft: '20px',
            backgroundColor: uploadResult?.success
              ? '#d4edda'
              : uploadResult?.error
                ? '#f8d7da'
                : '#ffffff',
            color: uploadResult?.success
              ? '#155724'
              : uploadResult?.error
                ? '#721c24'
                : '#000000',
          }}
          bindinput={(e) => {
            console.log('Input event:', e);
          }}
        />
      </view>
    </view>
  );
}
