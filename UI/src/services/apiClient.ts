import axios from 'axios';

const apiClient = axios.create({
    // Lấy URL của gateway từ file .env
    baseURL: import.meta.env.GATEWAY_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// (Sau này bạn sẽ thêm Interceptor ở đây để gắn JWT token)

export default apiClient;
