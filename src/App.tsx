import { AppRouter } from './navigation/AppRouter.js';
import { useDatabaseInitialization } from './hooks/useDatabaseInitialization.js';
import { useServerInitialization } from './hooks/useServerInitialization.js';
import { ServerSetup } from './modules/shared/presentation/ServerSetup.js';
import './App.css';

export function App() {
  const { isInitialized, error } = useDatabaseInitialization();
  const {
    isServerConfigured,
    isChecking: isCheckingServer,
    error: serverError,
    setServerConfigured,
  } = useServerInitialization();

  // Show loading state while database or server initializes
  if ((!isInitialized && !error) || isCheckingServer) {
    return (
      <view
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <text>Initializing app...</text>
      </view>
    );
  }

  // Show error state if database initialization fails
  if (error) {
    return (
      <view
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
        }}
      >
        <text style={{ color: 'red', textAlign: 'center' }}>
          Database initialization failed: {error}
        </text>
      </view>
    );
  }

  // Show error state if server configuration check fails
  if (serverError) {
    return (
      <view
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
        }}
      >
        <text style={{ color: 'red', textAlign: 'center' }}>
          Server configuration error: {serverError}
        </text>
      </view>
    );
  }

  // Show server setup if not configured
  if (!isServerConfigured) {
    return (
      <ServerSetup
        onServerConfigured={() => {
          setServerConfigured();
        }}
      />
    );
  }

  // App is ready, show the router
  return <AppRouter />;
}
