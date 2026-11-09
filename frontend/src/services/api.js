import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.endsWith('/login/');
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('servigo_user');
      if (window.location.pathname !== '/login') {
        window.location.replace('/login?session=expired');
      }
    }
    return Promise.reject(error);
  }
);

export default API;