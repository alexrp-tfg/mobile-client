import { AppRouter } from './navigation/AppRouter.js';
import { useDatabaseInitialization } from './hooks/useDatabaseInitialization.js';
import './App.css';

export function App() {
  const { isInitialized, error } = useDatabaseInitialization();

  // Show loading state while database initializes
  if (!isInitialized && !error) {
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

  // App is ready, show the router
  return <AppRouter />;
}
