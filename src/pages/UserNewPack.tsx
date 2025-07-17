import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';

const UserNewPack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; lastname: string; gym_id: number } | null>(null);
  const [disciplines, setDisciplines] = useState<Array<{ id: number; name: string }>>([]);
  const [packs, setPacks] = useState<Array<{ id: number; pack_name: string; price: number; class_quantity: number; months: number; gym: { id: number; name: string } }>>([]);
  const [formData, setFormData] = useState({
    start_date: '',
    expiration_date: '',
    status: 1,
    gym_id: 0,
    user_id: 0,
    pack_id: '',
    discipline_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [disciplinesLoading, setDisciplinesLoading] = useState(true);
  const [packsLoading, setPacksLoading] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Preparar los datos para enviar al backend
      const packageData = {
        start_date: new Date(formData.start_date).toISOString(),
        expiration_date: new Date(formData.expiration_date).toISOString(),
        status: formData.status,
        gym_id: formData.gym_id,
        user_id: formData.user_id,
        pack_id: parseInt(formData.pack_id),
        discipline_id: parseInt(formData.discipline_id)
      };
      
      //console.log('Datos del paquete a enviar:', packageData);
      
      // Enviar datos al backend
      const response = await axiosInstance.post('http://192.168.100.18:8080/user_packs', packageData);
      console.log('Respuesta del backend:', response.data);
      
      // Redirigir de vuelta al detalle del usuario
      navigate(`/users-detail/${id}`);
    } catch (error) {
      console.error('Error al crear el paquete:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`http://192.168.100.18:8080/users/${id}`);
        //console.log(res.data);
        setUser(res.data);
        // Actualizar formData con los datos del usuario
        setFormData(prev => ({
          ...prev,
          user_id: parseInt(id || '0'),
          gym_id: res.data.gym?.id || 0
        }));
      } catch (err) {
        console.error('Error al cargar el usuario:', err);
      } finally {
        setUserLoading(false);
      }
    };

    const fetchDisciplines = async () => {
      try {
        const res = await axiosInstance.get('http://192.168.100.18:8080/disciplines');
        //console.log('Disciplinas:', res.data);
        setDisciplines(res.data);
      } catch (err) {
        console.error('Error al cargar las disciplinas:', err);
      } finally {
        setDisciplinesLoading(false);
      }
    };

    const fetchPacks = async () => {
      try {
        const res = await axiosInstance.get('http://192.168.100.18:8080/packs');
        //console.log('Packs:', res.data);
        setPacks(res.data);
      } catch (err) {
        console.error('Error al cargar los paquetes:', err);
      } finally {
        setPacksLoading(false);
      }
    };

    fetchUser();
    fetchDisciplines();
    fetchPacks();
  }, [id]);

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h1 className="card-title h3 fw-bold mb-0">
                <i className="bi bi-box-seam me-2"></i>
                Nuevo Paquete - {userLoading ? 'Cargando...' : `${user?.name} ${user?.lastname}`}
              </h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Fecha de inicio */}
                  <div className="col-md-6">
                    <label htmlFor="start_date" className="form-label fw-bold">
                      <i className="bi bi-calendar-event me-2"></i>
                      Fecha de inicio
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Fecha de expiración */}
                  <div className="col-md-6">
                    <label htmlFor="expiration_date" className="form-label fw-bold">
                      <i className="bi bi-calendar-x me-2"></i>
                      Fecha de expiración
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="expiration_date"
                      name="expiration_date"
                      value={formData.expiration_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Estado */}
                  <div className="col-md-6">
                    <label htmlFor="status" className="form-label fw-bold">
                      <i className="bi bi-toggle-on me-2"></i>
                      Estado
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>

                  {/* Pack */}
                  <div className="col-md-6">
                    <label htmlFor="pack_id" className="form-label fw-bold">
                      <i className="bi bi-box me-2"></i>
                      Pack
                    </label>
                    <select
                      className="form-select"
                      id="pack_id"
                      name="pack_id"
                      value={formData.pack_id}
                      onChange={handleInputChange}
                      required
                      disabled={packsLoading}
                    >
                      <option value="">Selecciona un paquete</option>
                      {packs.map((pack) => (
                        <option key={pack.id} value={pack.id}>
                          {pack.pack_name} - ${pack.price?.toLocaleString()} ({pack.class_quantity} clases, {pack.months} mes{pack.months > 1 ? 'es' : ''})
                        </option>
                      ))}
                    </select>
                    {packsLoading && (
                      <div className="form-text">
                        <small className="text-muted">
                          <i className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></i>
                          Cargando paquetes...
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Disciplina */}
                  <div className="col-md-6">
                    <label htmlFor="discipline_id" className="form-label fw-bold">
                      <i className="bi bi-trophy me-2"></i>
                      Disciplina
                    </label>
                    <select
                      className="form-select"
                      id="discipline_id"
                      name="discipline_id"
                      value={formData.discipline_id}
                      onChange={handleInputChange}
                      required
                      disabled={disciplinesLoading}
                    >
                      <option value="">Selecciona una disciplina</option>
                      {disciplines.map((discipline) => (
                        <option key={discipline.id} value={discipline.id}>
                          {discipline.name}
                        </option>
                      ))}
                    </select>
                    {disciplinesLoading && (
                      <div className="form-text">
                        <small className="text-muted">
                          <i className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></i>
                          Cargando disciplinas...
                        </small>
                      </div>
                    )}
                  </div>


                </div>
                
                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Paquete
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate(`/users-detail/${id}`)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserNewPack; 