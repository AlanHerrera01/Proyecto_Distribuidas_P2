import axios from 'axios';

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8081/api', // Base URL configurable por variable de entorno
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
