import API from './api';

export const authService = {
  // Petición para inicio de sesión
  login: async (credentials) => {
    // const response = await API.post('/auth/login', credentials);
    // return response.data;
    console.log('Enviando credenciales al Backend:', credentials);
  },

  // Petición para registro de usuarios
  register: async (userData) => {
    // const response = await API.post('/auth/register', userData);
    // return response.data;
    console.log('Enviando datos de registro al Backend:', userData);
  }
};
