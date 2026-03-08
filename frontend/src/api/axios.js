import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const user = localStorage.getItem('certUser');
    if (user) {
        const parsed = JSON.parse(user);
        if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('certUser');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
