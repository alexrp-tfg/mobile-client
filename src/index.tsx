import { root } from '@lynx-js/react';

import { App } from './App';
import { MemoryRouter, Route, Router, Routes, useNavigate } from 'react-router';
import { Test } from './Test.js';


root.render(
    <MemoryRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route
                path="*"
                element={<Test />}
            />
        </Routes>
    </MemoryRouter>,
);

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
}
