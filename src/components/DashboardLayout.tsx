import React from 'react';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      {/* Contenido principal con margen para el sidebar */}
      <main className="d-lg-block" style={{ marginLeft: '280px' }}>
        <div className="container-fluid py-4">
          {children}
        </div>
      </main>
      {/* Para móviles, el contenido ocupa todo el ancho */}
      <main className="d-lg-none">
        <div className="container-fluid py-4">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 