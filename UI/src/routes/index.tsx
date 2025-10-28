import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from '../features/common/pages/HomePage';
import { BookingPreviewPage } from '../features/booking/pages/BookingPreviewPage';
export const AppRouter = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPreviewPage />} />
        </Routes>
    </BrowserRouter>
);
