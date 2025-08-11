import { root } from '@lynx-js/react';

import { App } from './App.js';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Test } from './Test.js';
import { BackButtonHandler } from './back-button-handler.js';
import './index.css';
import { SafeAreaView } from './safe-area.js';

function AppWrapper() {
  return (
    <MemoryRouter>
      <BackButtonHandler />
      <SafeAreaView>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="*" element={<Test />} />
        </Routes>
      </SafeAreaView>
    </MemoryRouter>
  );
}

root.render(AppWrapper());

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
