import { MemoryRouter, Route, Routes } from 'react-router';
import { ImageGallery } from '../modules/gallery/presentation/ImageGallery.js';
import { ImageUpload } from '../modules/media/presentation/ImageUpload.js';
import { BackButtonHandler } from './back-button-handler.js';
import { SafeAreaView } from './safe-area.js';

export function AppRouter() {
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <SafeAreaView>
        <Routes>
          <Route path="/" element={<ImageGallery />} />
          <Route path="/upload" element={<ImageUpload />} />
          <Route path="*" element={<ImageUpload />} />
        </Routes>
      </SafeAreaView>
    </MemoryRouter>
  );
}
