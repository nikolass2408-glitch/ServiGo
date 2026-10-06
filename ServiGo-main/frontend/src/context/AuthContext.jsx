import React, {
  createContext,
  useState,
  useContext
} from 'react';

import API from '../services/api';

const AuthContext = createContext();

// Traduce el rol del backend (CLI, PRO, ADMIN...) al que usa el frontend
const normalizarRol = (rol) => {
  const r = String(rol || '').toUpperCase();

  if (['CLI', 'CLIENTE'].includes(r)) return 'cliente';

  if (['PRO', 'PROF', 'PROFESIONAL', 'PRESTADOR'].includes(r))
    return 'profesional';

  if (['ADM', 'ADMIN', 'ADMINISTRADOR'].includes(r)) return 'admin';

  return String(rol || '').toLowerCase();
};

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      const usuarioGuardado = localStorage.getItem('servigo_user');

      if (usuarioGuardado) {
        return JSON.parse(usuarioGuardado);
      }

      return null;
    } catch (error) {
      console.error('Error recuperando la sesión:', error);
      return null;
    }
  });

  // ================================
  // LOGIN REAL CONTRA EL BACKEND
  // ================================
  const login = async (username, password) => {

    const response = await API.post('/login/', {
      username,
      password
    });

    const { token, usuario } = response.data;

    console.log('Respuesta del backend:', usuario);

    const usuarioNormalizado = {
      ...usuario,
      rol: normalizarRol(usuario.rol)
    };

    // Guardar JWT
    localStorage.setItem('token', token);

    // Guardar usuario
    localStorage.setItem(
      'servigo_user',
      JSON.stringify(usuarioNormalizado)
    );

    setUser(usuarioNormalizado);

    return usuarioNormalizado;
  };

  // ================================
  // CERRAR SESIÓN
  // ================================
  const logout = () => {
    setUser(null);

    localStorage.removeItem('servigo_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}