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

// Augment Lynx's IntrinsicElements
declare module '@lynx-js/types' {
  interface IntrinsicElements {
    input: InputProps;
  }
}

// Augment React's JSX.IntrinsicElements
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends LynxIntrinsicElements {
      input: InputProps;
    }
  }
}
