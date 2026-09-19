import API from './api';

export const bookingService = {
  // Obtener todas las reservas
  getReservas: async () => {
    // const response = await API.get('/reservas');
    // return response.data;
  },

  // Crear una nueva reserva
  crearReserva: async (reservaData) => {
    // const response = await API.post('/reservas', reservaData);
    // return response.data;
    console.log('Nueva reserva enviada al servidor:', reservaData);
  }
};