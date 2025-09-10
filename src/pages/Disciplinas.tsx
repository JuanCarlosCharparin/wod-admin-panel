import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Discipline, CreateDisciplineRequest, UpdateDisciplineRequest } from '../types/disciplines';

const Disciplinas = () => {
  useParams();
  const { user: authUser } = useAuth();
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState<Discipline | null>(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Función para obtener disciplinas (extraída del useEffect)
  const fetchDisciplines = useCallback(async () => {
    if (!authUser || !authUser.gym) return;

    const gymId = authUser.gym.id;

    try {
      setLoading(true);
      
      const response = await axiosInstance.get(`http://localhost:8080/disciplines/gym/${gymId}`);
      
      // La respuesta es directamente un array de disciplinas
      setDisciplines(response.data || []);
      setTotal(response.data?.length || 0);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar las disciplinas del gimnasio');
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchDisciplines();
  }, [fetchDisciplines]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !authUser.gym) {
      alert('No se pudo obtener la información del gimnasio');
      return;
    }

    setFormLoading(true);
    try {
      const disciplineData: CreateDisciplineRequest = {
        name: formData.name,
        gym_id: authUser.gym.id
      };

      await axiosInstance.post('http://localhost:8080/disciplines', disciplineData);
      setShowModal(false);
      setFormData({ name: '' });
      fetchDisciplines();
      alert('Disciplina creada correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al crear la disciplina');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDiscipline) return;

    setFormLoading(true);
    try {
      const updateData: UpdateDisciplineRequest = {
        name: formData.name
      };

      await axiosInstance.put(`http://localhost:8080/disciplines/${editingDiscipline.id}`, updateData);
      setShowModal(false);
      setEditingDiscipline(null);
      setFormData({ name: '' });
      fetchDisciplines();
      alert('Disciplina actualizada correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al actualizar la disciplina');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (disciplineId: number, disciplineName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la disciplina "${disciplineName}"?`)) {
      return;
    }

    setDeleteLoading(disciplineId);
    try {
      await axiosInstance.delete(`http://localhost:8080/disciplines/${disciplineId}`);
      setDisciplines(disciplines.filter(discipline => discipline.id !== disciplineId));
      alert('Disciplina eliminada correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al eliminar la disciplina');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (discipline: Discipline) => {
    setEditingDiscipline(discipline);
    setFormData({
      name: discipline.name
    });
    setShowModal(true);
  };

  const handleNewDiscipline = () => {
    setEditingDiscipline(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscipline(null);
    setFormData({ name: '' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando disciplinas del gimnasio...</p>
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
                <h1 className="card-title h3 fw-bold text-dark mb-1">Disciplinas</h1>
                <p className="card-text text-muted mb-0">
                  Gestiona las disciplinas del gimnasio: <strong>{authUser?.gym?.name}</strong>
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-primary fs-6">{disciplines.length} disciplinas</span>
                <button
                  onClick={handleNewDiscipline}
                  className="btn btn-primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nueva Disciplina
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Disciplines Table */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="px-3 py-3">ID</th>
                      <th scope="col" className="px-3 py-3">Nombre</th>
                      <th scope="col" className="px-3 py-3">Gimnasio</th>
                      <th scope="col" className="px-3 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplines.map(discipline => (
                      <tr key={discipline.id}>
                        <td className="px-3 py-3 fw-medium">{discipline.id}</td>
                        <td className="px-3 py-3 fw-medium">{discipline.name}</td>
                        <td className="px-3 py-3">
                          <span className="text-primary">{discipline.gym.name}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => handleEdit(discipline)}
                              className="btn btn-outline-primary btn-sm"
                              title="Editar disciplina"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(discipline.id, discipline.name)}
                              className="btn btn-outline-danger btn-sm"
                              disabled={deleteLoading === discipline.id}
                              title="Eliminar disciplina"
                            >
                              {deleteLoading === discipline.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
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
        {disciplines.length === 0 && (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="display-1 text-muted mb-3">🏃‍♂️</div>
                <h3 className="h5 fw-bold text-dark mb-2">No hay disciplinas</h3>
                <p className="text-muted">No se encontraron disciplinas en este gimnasio.</p>
                <button
                  onClick={handleNewDiscipline}
                  className="btn btn-primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear Primera Disciplina
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Total count */}
        {disciplines.length > 0 && (
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <span className="text-muted">
                Total: {total} disciplinas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar disciplina */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingDiscipline ? 'Editar Disciplina' : 'Nueva Disciplina'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={formLoading}
                ></button>
              </div>
              <form onSubmit={editingDiscipline ? handleUpdate : handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Nombre de la Disciplina <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={formLoading}
                      placeholder="Ej: CrossFit, Yoga, Pilates..."
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={formLoading || !formData.name.trim()}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingDiscipline ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      editingDiscipline ? 'Actualizar' : 'Crear'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Disciplinas;
