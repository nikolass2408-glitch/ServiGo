import axios from 'axios';

// Instancia global de Axios orientada al backend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Puerto estándar para el servidor Node/Express
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adjuntar automáticamente el Token JWT si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;