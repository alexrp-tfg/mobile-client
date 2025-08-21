import { useState } from '@lynx-js/react';
import { useLocation } from 'react-router';
import { diContainer } from '../../../di/container.js';
import { MediaUploadError, MediaUploadResult } from '../domain/entities.js';
import type { GetAllImagesDto } from '../../shared/infrastructure/dtos/get-all-images.dto.js';
import { APP_CONFIG } from '../../../config/app.config.js';

export function ImageUpload() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<
    MediaUploadResult | MediaUploadError | null
  >(null);

  const [inputValue, setInputValue] = useState('');
  const [userImages, setUserImages] = useState<GetAllImagesDto[]>([]);

  const uploadImageUseCase = diContainer.getUploadImageUseCase();
  const loginUserUseCase = diContainer.getLoginUserUseCase();
  const getUserAllImagesUseCase = diContainer.getGetUserAllImagesUseCase();
  const imageUrl = location.state?.imageUrl;

  const handleImageUpload = async () => {
    if (!imageUrl) {
      setUploadResult(null);
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
    } catch {
      setUploadResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleButtonTap = async () => {
    await loginUserUseCase.execute('admin', inputValue);
    const userImages = await getUserAllImagesUseCase.execute();
    setUserImages(userImages);
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
            uploadResult instanceof MediaUploadResult
              ? 'Upload successful!'
              : uploadResult instanceof MediaUploadError
                ? uploadResult.message
                : 'Tap image to upload'
          }
          value={
            uploadResult instanceof MediaUploadResult
              ? 'Upload successful!'
              : uploadResult instanceof MediaUploadError
                ? uploadResult.message
                : 'Tap image to upload'
          }
          style={{
            height: '100px',
            paddingLeft: '20px',
            backgroundColor: uploadResult ? '#d4edda' : '#ffffff',
            color: uploadResult ? '#155724' : '#000000',
          }}
          bindinput={(e) => {
            setInputValue(e.detail.value);
          }}
        />
      </view>
      <view
        style={{ padding: '20px', textAlign: 'center' }}
        bindtap={handleButtonTap}
      >
        <text>Send request</text>
      </view>
      <view>
        {userImages.length > 0 && (
          <view style={{ padding: '20px' }}>
            <text>Uploaded Images:</text>
            <view style={{ display: 'flex', flexDirection: 'column' }}>
              {userImages.map((image) => (
                <image
                  key={image.id}
                  src={`${APP_CONFIG.API.BASE_URL}/media/stream/${image.id}`}
                  style={{ width: '100px', height: '100px', margin: '10px' }}
                  mode="aspectFit"
                />
              ))}
            </view>
          </view>
        )}
      </view>
    </view>
  );
}
