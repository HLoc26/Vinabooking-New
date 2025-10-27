import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/common/pages/HomePage';

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>
    </BrowserRouter>
);
