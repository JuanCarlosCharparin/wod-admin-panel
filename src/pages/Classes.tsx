import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

const Classes = () => {
  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title h3 fw-bold text-dark mb-1">
                🏋️ Clases
              </h1>
              <p className="card-text text-muted">
                Aquí podrás gestionar las clases y actividades del gimnasio.
              </p>
            </div>
          </div>
        </div>
        {/* Tarjeta de carga masiva de clases */}
        <div className="col-12 col-md-6 col-lg-4">
          <button
            type="button"
            className="card bg-success text-white shadow-sm h-100 w-100 border-0"
            style={{ cursor: 'pointer' }}
            onClick={() => window.location.href = '/classes/bulk-upload'}
          >
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-1">Carga masiva de clases</h5>
                <p className="card-text small opacity-75">Sube varias clases de manera rápida y sencilla</p>
              </div>
              <span className="fs-1">📥</span>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Classes; 