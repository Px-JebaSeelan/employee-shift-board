import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!['/login', '/signup'].includes(window.location.pathname)) {
                window.location.href = '/login';
            }
        }
        error.displayMessage = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    getEmployees: () => api.get('/auth/employees')
};

export const shiftsAPI = {
    create: (data) => api.post('/shifts', data),
    getAll: (date) => api.get('/shifts', { params: date ? { date } : {} }),
    delete: (id) => api.delete(`/shifts/${id}`)
};

export default api;
