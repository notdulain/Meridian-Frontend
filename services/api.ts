import axios from 'axios';

const AUTH_BYPASS_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/revoke',
    '/api/auth/logout',
];

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const url = config.url || '';
        const isAuthCall = AUTH_BYPASS_PATHS.some((path) => url.startsWith(path));
        const token = localStorage.getItem('meridian_token');
        if (token && !isAuthCall) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
