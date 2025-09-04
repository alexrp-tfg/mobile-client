import { useState, useCallback } from '@lynx-js/react';

interface UseStatusMessageReturn {
  message: string;
  showMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
  hideMessage: () => void;
  clearMessage: () => void;
}

export function useStatusMessage(): UseStatusMessageReturn {
  const [message, setMessage] = useState<string>('');

  const showMessage = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
      // Include type in message for backward compatibility with existing error detection
      const messageWithType = type === 'error' ? `Error: ${msg}` : msg;
      setMessage(messageWithType);
    },
    [],
  );

  const hideMessage = useCallback(() => {
    setMessage('');
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    showMessage,
    hideMessage,
    clearMessage,
  };
}
