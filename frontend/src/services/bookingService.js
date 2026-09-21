import API from './api';

export const bookingService = {
  getReservas: async () => {
    const response = await API.get('/reservas/lista/');
    return response.data;
  },

  crearReserva: async (reservaData) => {
    const response = await API.post('/reservas/', reservaData);
    return response.data;
  },

  confirmarReserva: async (id) => {
    const response = await API.patch(
      `/reservas/${id}/confirmar/`
    );

    return response.data;
  },

  obtenerReserva: async (id) => {
    const response = await API.get(
      `/reservas/${id}/`
    );

    return response.data;
  }
};
