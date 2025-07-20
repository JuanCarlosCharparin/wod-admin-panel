import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';

type UserPackHistory = {
  id: number;
  start_date: string;
  expiration_date: string;
  status: number;
  pack: {
    id: number;
    pack_name: string;
    price: number;
    class_quantity: number;
  };
  discipline: {
    id: number;
    name: string;
  };
};

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; lastname: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userPacksHistory, setUserPacksHistory] = useState<UserPackHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:8080/users/${id}`);
        setUser(res.data);
      } catch (err) {
        setError('Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchUserPacksHistory = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:8080/user_packs/user/${id}`);
        setUserPacksHistory(res.data);
      } catch (err) {
        console.error('Error al cargar el historial de packs:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchUserPacksHistory();
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
        <hr className="my-4" />
        <h2 className="h5 fw-bold mb-3">Historial de Packs Contratados</h2>
        {historyLoading ? (
          <div>Cargando historial...</div>
        ) : userPacksHistory.length === 0 ? (
          <div className="alert alert-info">Este alumno aún no ha contratado ningún pack.</div>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Pack</th>
                <th>Disciplina</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th>Clases</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {userPacksHistory.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>{item.pack.pack_name}</td>
                  <td>{item.discipline.name}</td>
                  <td>{new Date(item.start_date).toLocaleDateString()}</td>
                  <td>{new Date(item.expiration_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${item.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                      {item.status === 1 ? 'Activo' : 'Vencido'}
                    </span>
                  </td>
                  <td>{item.pack.class_quantity}</td>
                  <td>${item.pack.price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDetail; 