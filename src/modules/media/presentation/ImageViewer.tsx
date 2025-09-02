import './ImageViewer.css';

interface ImageViewerProps {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  mode?: 'aspectFit' | 'aspectFill' | 'scaleToFill' | 'center';
  loading?: boolean;
  onClick?: () => void;
}

export function ImageViewer({
  src,
  alt = 'Image',
  width = '100%',
  height = 'auto',
  mode = 'aspectFit',
  loading = false,
  onClick,
}: ImageViewerProps) {
  if (loading) {
    return (
      <view className="image-viewer-container" style={{ width, height }}>
        <view className="image-viewer-loading">
          <text>Loading image...</text>
        </view>
      </view>
    );
  }

  return (
    <view className="image-viewer-container" style={{ width, height }}>
      <image
        src={src}
        mode={mode}
        placeholder={alt}
        className="image-viewer-image"
        bindtap={onClick}
        style={{
          width: '100%',
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
        }}
      />
    </view>
  );
}
