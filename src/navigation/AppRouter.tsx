import { MemoryRouter, Route, Routes } from 'react-router';
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

export function AppRouter() {
  console.log('Rendering AppRouter');
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <SafeAreaView>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ImageGallery />
                <BottomNavigationBar />
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
                <BottomNavigationBar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/online-gallery"
            element={
              <ProtectedRoute>
                <OnlineGallery />
                <BottomNavigationBar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
                <BottomNavigationBar />
              </ProtectedRoute>
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
      </SafeAreaView>
    </MemoryRouter>
  );
}
