import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import DashboardCliente from '../pages/cliente/DashboardCliente';
import DashboardProfesional from '../pages/profesional/DashboardProfesional';
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import ProtectedRoute from './ProtectedRoute'; // 1. Importamos la ruta protegida

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Categorias from '../components/Categorias';
import ComoFunciona from '../components/ComoFunciona';
import BannerProfesionales from '../components/BannerProfesionales';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Categorias />
      <ComoFunciona />
      <BannerProfesionales />
      <Footer />
    </>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      
      {/* RUTAS PROTEGIDAS POR ROL */}
      <Route 
        path="/cliente" 
        element={
          <ProtectedRoute allowedRoles={['cliente']}>
            <DashboardCliente />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profesional" 
        element={
          <ProtectedRoute allowedRoles={['profesional']}>
            <DashboardProfesional />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}