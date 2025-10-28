import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/common/pages/HomePage';
import AccommodationDetailPage from '../features/accommodation/pages/DetailPage';

export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/accommodation/:accommodationId" element={<AccommodationDetailPage />} />
        </Routes>
    </BrowserRouter>
);
