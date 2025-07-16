import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';


type Gym = {
  id: number;
  name: string;
};

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    gender: '',
    phone: '',
    email: '',
    dni: '',
    birth_date: '',
    gym_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar gimnasios
        const gymsResponse = await axiosInstance.get('http://localhost:8080/gyms');
        setGyms(gymsResponse.data);

        // Cargar datos del usuario
        const userResponse = await axiosInstance.get(`http://localhost:8080/users/${id}`);
        // Si tu backend devuelve { data: null, ... }
        const user = userResponse.data.data || userResponse.data;

        if (!user) {
          setError('Usuario no encontrado');
          setLoading(false);
          return;
        }

        setFormData({
          name: user.name || '',
          lastname: user.lastname || '',
          gender: user.gender || '',
          phone: user.phone || '',
          email: user.email || '',
          dni: user.dni || '',
          birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
          gym_id: user.gym?.id?.toString() || '',
        });

        setLoading(false);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos del usuario');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        gym_id: parseInt(formData.gym_id) || null,
        role_id: 3 // Mantener como alumno normal
      };

      await axiosInstance.put(`http://localhost:8080/users/${id}`, payload);
      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/users');
      }, 2000);
    } catch (err: any) {
      console.error('Error actualizando usuario:', err);
      setError(err.response?.data?.error || 'Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex align-items-center justify-content-center" style={{ height: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted">Cargando datos del usuario...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !loading) {
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
                <h1 className="card-title h3 fw-bold text-dark mb-1">Editar Usuario</h1>
                <p className="card-text text-muted mb-0">Modifica la información del usuario</p>
              </div>
              <button
                onClick={() => navigate('/users')}
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Volver a Usuarios
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="col-12">
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              ✅ Usuario actualizado correctamente. Redirigiendo...
            </div>
          </div>
        )}

        {/* Form */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-person me-2"></i>
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-person me-2"></i>
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      className="form-control"
                      value={formData.lastname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-gender-ambiguous me-2"></i>
                      Género
                    </label>
                    <select
                      name="gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar género</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-telephone me-2"></i>
                      Teléfono
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-card-text me-2"></i>
                      DNI
                    </label>
                    <input
                      type="text"
                      name="dni"
                      className="form-control"
                      value={formData.dni}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-calendar me-2"></i>
                      Fecha de Nacimiento
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      className="form-control"
                      value={formData.birth_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">
                      <i className="bi bi-building me-2"></i>
                      Gimnasio
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={gyms.find(g => g.id === parseInt(formData.gym_id))?.name || ''}
                      disabled
                      readOnly
                    />
                  </div>

                  <div className="col-12">
                    <div className="d-flex justify-content-end gap-3">
                      <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="btn btn-outline-secondary px-4"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary px-4"
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-check-circle me-2"></i>
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserEdit; 