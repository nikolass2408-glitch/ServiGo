import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // 1. Si el usuario no ha iniciado sesión, lo redirigimos al Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si se especificaron roles permitidos y el rol del usuario no está en la lista:
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Redirigir según el rol que realmente tiene
    if (user.rol === 'cliente') return <Navigate to="/cliente" replace />;
    if (user.rol === 'profesional') return <Navigate to="/profesional" replace />;
    if (user.rol === 'admin') return <Navigate to="/admin" replace />;
  }

  // 3. Si pasa las verificaciones, muestra el contenido de la ruta
  return children;
}