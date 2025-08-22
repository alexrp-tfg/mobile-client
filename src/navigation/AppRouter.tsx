import { MemoryRouter, Route, Routes } from 'react-router';
import { ImageGallery } from '../modules/gallery/presentation/ImageGallery.js';
import { ImageUpload } from '../modules/media/presentation/ImageUpload.js';
import { LoginPage } from '../modules/authorization/presentation/LoginPage.js';
import { ProtectedRoute } from './ProtectedRoute.js';
import { BackButtonHandler } from './back-button-handler.js';
import { SafeAreaView } from './safe-area.js';

export function AppRouter() {
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <SafeAreaView>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/gallery"
            element={
              <ProtectedRoute>
                <ImageGallery />
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
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </SafeAreaView>
    </MemoryRouter>
  );
}
