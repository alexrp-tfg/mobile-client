import { useEffect, useState } from '@lynx-js/react';

interface ServerInitializationState {
  isServerConfigured: boolean;
  isChecking: boolean;
  error: string | null;
}

export function useServerInitialization() {
  const [state, setState] = useState<ServerInitializationState>({
    isServerConfigured: false,
    isChecking: true,
    error: null,
  });

  useEffect(() => {
    const checkServerConfiguration = async () => {
      try {
        // Check if server URL is stored
        const serverUrl =
          NativeModules.NativeLocalStorageModule.getStorageItem('serverUrl');

        setState({
          isServerConfigured: !!serverUrl,
          isChecking: false,
          error: null,
        });
      } catch (error) {
        console.error('Error checking server configuration:', error);
        setState({
          isServerConfigured: false,
          isChecking: false,
          error: 'Failed to check server configuration',
        });
      }
    };

    checkServerConfiguration();
  }, []);

  const setServerConfigured = () => {
    // Server URL is already saved by the ServerSetup component
    setState({
      isServerConfigured: true,
      isChecking: false,
      error: null,
    });
  };

  return {
    ...state,
    setServerConfigured,
  };
}
