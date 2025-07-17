import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; lastname: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`http://192.168.100.18:8080/users/${id}`);
        setUser(res.data);
      } catch (err) {
        setError('Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando usuario...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title h3 fw-bold text-dark mb-1">
                {user?.name} {user?.lastname}
              </h1>
            </div>
          </div>
        </div>
        {/* Tarjeta Nuevo paquete */}
        <div className="col-12 col-md-6 col-lg-4">
          <button
            type="button"
            className="card bg-success text-white shadow-sm h-100 w-100 border-0"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/users-newpack/${id}`)}
          >
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title fw-bold mb-1">Nuevo paquete</h5>
                <p className="card-text small opacity-75">Gestiona los paquetes del usuario</p>
              </div>
              <span className="fs-1">📦</span>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetail; 