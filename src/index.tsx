import { root, useCallback, useLynxGlobalEventListener } from '@lynx-js/react';

import { App } from './App';
import { MemoryRouter, Route, Router, Routes, useNavigate } from 'react-router';
import { Test } from './Test.js';
import { BackButtonHandler } from './back-button-handler.js';

function AppWrapper() {
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="*" element={<Test />} />
      </Routes>
    </MemoryRouter>
  );
}

root.render(AppWrapper());

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
