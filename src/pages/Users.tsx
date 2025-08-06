import { useEffect, useState } from 'react';
//import axios from 'axios';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type User = {
  id: number;
  name: string;
  lastname: string;
  gender: string;
  phone: string
  email: string;
  dni: string;
  birth_date: string;
  gym: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
  status: boolean;
  user_packs: {
    id: number;
    start_date: string;
    expiration_date: string;
    status: number;
  }[];
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms de espera

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    setLoading(true);
    
    // Verificar que el usuario autenticado tenga un gimnasio
    if (!authUser?.gym?.id) {

      setError('No se pudo obtener la información del gimnasio');
      setLoading(false);
      return;
    }

    const gymId = authUser.gym.id;
    axiosInstance.get(`http://localhost:8080/users/gym/${gymId}/3`, {
      params: {
        page,
        limit,
        search: debouncedSearch
      }
    }) 
      .then(res => {
        //console.log(res.data)
        // Ajusta según la estructura de tu respuesta
        setUsers(res.data.data || []);
        setTotalPages(res.data.total_pages);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar los usuarios del gimnasio');
        setLoading(false);
      });
  }, [authUser?.gym?.id, page, limit, debouncedSearch]);

  const handleDelete = async (userId: number, userName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${userName}?`)) {
      return;
    }

    setDeleteLoading(userId);
    try {
      await axiosInstance.delete(`http://localhost:8080/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      alert('Usuario eliminado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el usuario');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (user: User) => {
    navigate(`/users-edit/${user.id}`);
  };

  const handleDetail = (user: User) => {
    navigate(`/users-detail/${user.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando usuarios del gimnasio...</p>
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
        {/* Header */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h1 className="card-title h3 fw-bold text-dark mb-1">Usuarios</h1>
                <p className="card-text text-muted mb-0">
                  Gestiona los usuarios del gimnasio: <strong>{authUser?.gym?.name}</strong>
                </p>
              </div>
              <div>
                <span className="badge bg-primary fs-6">{users.length} usuarios</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="px-3 py-3">Nombre</th>
                      <th scope="col" className="px-3 py-3">Apellido</th>
                      <th scope="col" className="px-3 py-3">Email</th>
                      <th scope="col" className="px-3 py-3">Teléfono</th>
                      <th scope="col" className="px-3 py-3">DNI</th>
                      <th scope="col" className="px-3 py-3">Fecha Vencimiento Pack</th>
                      <th scope="col" className="px-3 py-3">Estado</th>
                      <th scope="col" className="px-3 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-3 py-3 fw-medium">{user.name}</td>
                        <td className="px-3 py-3">{user.lastname}</td>
                        <td className="px-3 py-3">
                          <span className="text-primary">{user.email}</span>
                        </td>
                        <td className="px-3 py-3">{user.phone || '-'}</td>
                        <td className="px-3 py-3">{user.dni}</td>
                        <td className="px-3 py-3">
                          {user.user_packs && user.user_packs.length > 0 ? (
                            new Date(user.user_packs[0].expiration_date).toLocaleDateString()
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-3">{user.status ? 'Activo' : 'Suspendido'}</td>
                        <td className="px-3 py-3">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="btn btn-outline-primary btn-sm"
                              title="Editar usuario"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, `${user.name} ${user.lastname}`)}
                              className="btn btn-outline-danger btn-sm"
                              disabled={deleteLoading === user.id}
                              title="Eliminar usuario"
                            >
                              {deleteLoading === user.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                            <button
                              onClick={() => handleDetail(user)}
                              className="btn btn-outline-info btn-sm"
                              title="Ver detalle del usuario"
                            >
                              <i className="bi bi-info-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="display-1 text-muted mb-3">👥</div>
                <h3 className="h5 fw-bold text-dark mb-2">No hay usuarios</h3>
                <p className="text-muted">No se encontraron usuarios en este gimnasio.</p>
              </div>
            </div>
          </div>
        )}

        {/* Controles de búsqueda y paginación */}
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-control w-auto"
            />
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="form-select w-auto">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span>Página {page} de {totalPages} (Total: {total})</span>
            <div>
              <button
                className="btn btn-secondary btn-sm me-2"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >Anterior</button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;


