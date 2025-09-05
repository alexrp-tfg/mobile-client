import type { IntrinsicElements as LynxIntrinsicElements } from '@lynx-js/types';

interface InputProps {
  className?: string;
  'text-color'?: string;
  value?: string;
  placeholder?: string;
  bindinput?: (e: { detail: { value: string } }) => void;
  style?: React.CSSProperties;
  onBlur?: () => void;
}

interface VideoProps {
  className?: string;
  style?: React.CSSProperties;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  volume?: number;
  
  // Event handlers
  bindready?: (e: { detail: { duration: number; videoWidth: number; videoHeight: number } }) => void;
  bindplay?: () => void;
  bindpause?: () => void;
  bindstop?: () => void;
  bindended?: () => void;
  binderror?: (e: { detail: { what: number; extra: number; message?: string } }) => void;
  bindloadstart?: () => void;
  bindbuffering?: (e: { detail: { buffering: boolean } }) => void;
  bindseeked?: (e: { detail: { currentTime: number } }) => void;
}

// Augment Lynx's IntrinsicElements
declare module '@lynx-js/types' {
  interface IntrinsicElements {
    input: InputProps;
    video: VideoProps;
  }
}

// Augment React's JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends LynxIntrinsicElements {
      input: InputProps;
      video: VideoProps;
    }
  }
}
