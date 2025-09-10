import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { Plan, CreatePlanRequest, UpdatePlanRequest } from '../types/planes';

const Planes = () => {
  useParams();
  const { user: authUser } = useAuth();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    pack_name: '',
    price: '',
    class_quantity: '',
    months: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Función para obtener planes (extraída del useEffect)
  const fetchPlanes = useCallback(async () => {
    if (!authUser || !authUser.gym) return;

    const gymId = authUser.gym.id;

    try {
      setLoading(true);
      
      const response = await axiosInstance.get(`http://localhost:8080/packs/gym/${gymId}`);
      
      // La respuesta es directamente un array de planes
      setPlanes(response.data || []);
      setTotal(response.data?.length || 0);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los planes del gimnasio');
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    fetchPlanes();
  }, [fetchPlanes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser || !authUser.gym) {
      alert('No se pudo obtener la información del gimnasio');
      return;
    }

    setFormLoading(true);
    try {
      const planData: CreatePlanRequest = {
        pack_name: formData.pack_name,
        price: Number(formData.price),
        class_quantity: Number(formData.class_quantity),
        months: Number(formData.months),
        gym_id: authUser.gym.id
      };

      await axiosInstance.post('http://localhost:8080/packs', planData);
      setShowModal(false);
      setFormData({ pack_name: '', price: '', class_quantity: '', months: '' });
      fetchPlanes();
      alert('Plan creado correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al crear el plan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPlan) return;

    setFormLoading(true);
    try {
      const updateData: UpdatePlanRequest = {
        pack_name: formData.pack_name,
        price: Number(formData.price),
        class_quantity: Number(formData.class_quantity),
        months: Number(formData.months)
      };

      await axiosInstance.put(`http://localhost:8080/packs/${editingPlan.id}`, updateData);
      setShowModal(false);
      setEditingPlan(null);
      setFormData({ pack_name: '', price: '', class_quantity: '', months: '' });
      fetchPlanes();
      alert('Plan actualizado correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al actualizar el plan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (planId: number, planName: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el plan "${planName}"?`)) {
      return;
    }

    setDeleteLoading(planId);
    try {
      await axiosInstance.delete(`http://localhost:8080/packs/${planId}`);
      setPlanes(planes.filter(plan => plan.id !== planId));
      alert('Plan eliminado correctamente');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error al eliminar el plan');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      pack_name: plan.pack_name,
      price: plan.price.toString(),
      class_quantity: plan.class_quantity.toString(),
      months: plan.months.toString()
    });
    setShowModal(true);
  };

  const handleNewPlan = () => {
    setEditingPlan(null);
    setFormData({ pack_name: '', price: '', class_quantity: '', months: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({ pack_name: '', price: '', class_quantity: '', months: '' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando planes del gimnasio...</p>
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
                <h1 className="card-title h3 fw-bold text-dark mb-1">Planes</h1>
                <p className="card-text text-muted mb-0">
                  Gestiona los planes del gimnasio: <strong>{authUser?.gym?.name}</strong>
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                <span className="badge bg-primary fs-6">{planes.length} planes</span>
                <button
                  onClick={handleNewPlan}
                  className="btn btn-primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nuevo Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Planes Table */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="px-3 py-3">ID</th>
                      <th scope="col" className="px-3 py-3">Nombre del Plan</th>
                      <th scope="col" className="px-3 py-3">Precio</th>
                      <th scope="col" className="px-3 py-3">Clases</th>
                      <th scope="col" className="px-3 py-3">Duración</th>
                      <th scope="col" className="px-3 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planes.map(plan => (
                      <tr key={plan.id}>
                        <td className="px-3 py-3 fw-medium">{plan.id}</td>
                        <td className="px-3 py-3 fw-medium">{plan.pack_name}</td>
                        <td className="px-3 py-3">
                          <span className="text-success fw-bold">
                            ${plan.price.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="badge bg-info">
                            {plan.class_quantity} clases
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="badge bg-secondary">
                            {plan.months} {plan.months === 1 ? 'mes' : 'meses'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              onClick={() => handleEdit(plan)}
                              className="btn btn-outline-primary btn-sm"
                              title="Editar plan"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(plan.id, plan.pack_name)}
                              className="btn btn-outline-danger btn-sm"
                              disabled={deleteLoading === plan.id}
                              title="Eliminar plan"
                            >
                              {deleteLoading === plan.id ? (
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
        {planes.length === 0 && (
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <div className="display-1 text-muted mb-3">📦</div>
                <h3 className="h5 fw-bold text-dark mb-2">No hay planes</h3>
                <p className="text-muted">No se encontraron planes en este gimnasio.</p>
                <button
                  onClick={handleNewPlan}
                  className="btn btn-primary"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Crear Primer Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Total count */}
        {planes.length > 0 && (
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <span className="text-muted">
                Total: {total} planes
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar plan */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPlan ? 'Editar Plan' : 'Nuevo Plan'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  disabled={formLoading}
                ></button>
              </div>
              <form onSubmit={editingPlan ? handleUpdate : handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="pack_name" className="form-label">
                      Nombre del Plan <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="pack_name"
                      value={formData.pack_name}
                      onChange={e => setFormData({ ...formData, pack_name: e.target.value })}
                      required
                      disabled={formLoading}
                      placeholder="Ej: Pack Mensual x8, Pack Trimestral x24..."
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                          Precio <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">$</span>
                          <input
                            type="number"
                            className="form-control"
                            id="price"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                            disabled={formLoading}
                            min="0"
                            step="100"
                            placeholder="20000"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="class_quantity" className="form-label">
                          Cantidad de Clases <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="class_quantity"
                          value={formData.class_quantity}
                          onChange={e => setFormData({ ...formData, class_quantity: e.target.value })}
                          required
                          disabled={formLoading}
                          min="1"
                          placeholder="8"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="months" className="form-label">
                      Duración (meses) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="months"
                      value={formData.months}
                      onChange={e => setFormData({ ...formData, months: e.target.value })}
                      required
                      disabled={formLoading}
                      min="1"
                      placeholder="1"
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
                    disabled={formLoading || !formData.pack_name.trim() || !formData.price || !formData.class_quantity || !formData.months}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingPlan ? 'Actualizando...' : 'Creando...'}
                      </>
                    ) : (
                      editingPlan ? 'Actualizar' : 'Crear'
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

export default Planes;

