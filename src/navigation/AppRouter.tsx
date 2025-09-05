import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { useMemo } from '@lynx-js/react';
import { ImageGallery } from '../modules/gallery/presentation/ImageGallery.js';
import { ImageUpload } from '../modules/media/presentation/ImageUpload.js';
import { OnlineGallery } from '../modules/media/presentation/OnlineGallery.js';
import { LoginPage } from '../modules/authorization/presentation/LoginPage.js';
import { SettingsPage } from '../modules/settings/SettingsPage.js';
import { ProtectedRoute } from './ProtectedRoute.js';
import { AuthGuard } from './AuthGuard.js';
import { BackButtonHandler } from './back-button-handler.js';
import { SafeAreaView } from './safe-area.js';
import { BottomNavigationBar } from './BottomNavigationBar.js';

function AppContent() {
  const location = useLocation();
  const showBottomNav = useMemo(
    () => !['/login', '/upload'].includes(location.pathname),
    [location.pathname],
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ImageGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthGuard>
              <LoginPage />
            </AuthGuard>
          }
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <ImageGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/online-gallery"
          element={
            <ProtectedRoute>
              <OnlineGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
              <SettingsPage />
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <ImageUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
      {showBottomNav && <BottomNavigationBar />}
    </>
  );
}

export function AppRouter() {
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <SafeAreaView>
        <AppContent />
      </SafeAreaView>
    </MemoryRouter>
  );
}
