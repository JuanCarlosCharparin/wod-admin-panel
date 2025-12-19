import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

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
    class_quantity: 0,
    discipline_ids: [] as number[]
  });
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [disciplinesLoading, setDisciplinesLoading] = useState(true);
  const [packsLoading, setPacksLoading] = useState(true);
  const { user: authUser } = useAuth();

  // Función para obtener la fecha y hora actual en formato datetime-local
  const getCurrentDateTime = (): string => {
    const now = new Date();
    // Ajustar por la zona horaria local
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  };

  // Función para calcular la fecha de expiración (fecha actual + 30 días)
  const getExpirationDateTime = (): string => {
    const now = new Date();
    // Agregar 30 días
    const expirationDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    // Ajustar por la zona horaria local
    const localDateTime = new Date(expirationDate.getTime() - expirationDate.getTimezoneOffset() * 60000);
    return localDateTime.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado un pack o ingresado cantidad de clases
    if (!formData.pack_id && (!formData.class_quantity || formData.class_quantity <= 0)) {
      alert('Debe seleccionar un paquete o ingresar una cantidad de clases válida');
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar los datos para enviar al backend (sin discipline_id)
      const packageData = {
        start_date: new Date(formData.start_date).toISOString(),
        expiration_date: new Date(formData.expiration_date).toISOString(),
        status: formData.status,
        gym_id: formData.gym_id,
        user_id: formData.user_id,
        pack_id: formData.pack_id ? parseInt(formData.pack_id) : null,
        class_quantity: formData.class_quantity || null
      };
      
      console.log('Datos del paquete a enviar:', packageData);
      
      // Enviar datos al backend para crear el user_pack
      const response = await axiosInstance.post('http://localhost:8080/user_packs', packageData);
      //console.log('Respuesta del backend (user_pack):', response.data);
      
      // Obtener el ID del user_pack creado
      const userPackId = response.data.id || response.data.user_pack_id;
      
      // Si hay disciplinas seleccionadas, enviar al segundo endpoint
      if (formData.discipline_ids.length > 0) {
        const disciplinesData = {
          user_pack_id: userPackId,
          discipline_ids: formData.discipline_ids
        };
        
        //console.log('Datos de disciplinas a enviar:', disciplinesData);
        
        // Enviar las disciplinas al segundo endpoint
        await axiosInstance.post('http://localhost:8080/user_packs_disciplines', disciplinesData);
        //console.log('Respuesta del backend (disciplines):', disciplinesResponse.data);
      }
      
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

  // Función para manejar la selección de pack - desactiva class_quantity
  const handlePackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      pack_id: value,
      class_quantity: 0 // Limpiar class_quantity cuando se selecciona un pack
    }));
  };

  // Función para manejar la entrada de cantidad de clases - desactiva pack_id
  const handleClassQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      class_quantity: parseInt(value) || 0,
      pack_id: '' // Limpiar pack_id cuando se ingresa cantidad de clases
    }));
  };

  const handleDisciplineChange = (disciplineId: number, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      discipline_ids: isChecked 
        ? [...prev.discipline_ids, disciplineId]
        : prev.discipline_ids.filter(id => id !== disciplineId)
    }));
  };

  useEffect(() => {
    // Inicializar fechas automáticas
    setFormData(prev => ({
      ...prev,
      start_date: getCurrentDateTime(),
      expiration_date: getExpirationDateTime()
    }));

    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`http://localhost:8080/users/${id}`);
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
      if (!authUser || !authUser.gym) return; 

      const gymId = authUser.gym.id;
      try {
        const res = await axiosInstance.get(`http://localhost:8080/disciplines/gym/${gymId}`);
        //console.log('Disciplinas:', res.data);
        setDisciplines(res.data);
      } catch (err) {
        console.error('Error al cargar las disciplinas:', err);
      } finally {
        setDisciplinesLoading(false);
      }
    };

    const fetchPacks = async () => {
      if (!authUser || !authUser.gym) return; 

      const gymId = authUser.gym.id;
      try {
        const res = await axiosInstance.get(`http://localhost:8080/packs/gym/${gymId}`);
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
  }, [id, authUser]);

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
                      onChange={handlePackChange}
                      disabled={packsLoading || formData.class_quantity > 0}
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
                    {formData.class_quantity > 0 && (
                      <div className="form-text">
                        <small className="text-warning">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Deshabilitado porque se ingresó cantidad de clases
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Cantidad de clases */}
                  <div className="col-md-6">
                    <label htmlFor="class_quantity" className="form-label fw-bold">
                      <i className="bi bi-123 me-2"></i>
                      Cantidad de clases
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="class_quantity"
                      name="class_quantity"
                      value={formData.class_quantity || ''}
                      onChange={handleClassQuantityChange}
                      min="1"
                      disabled={formData.pack_id !== ''}
                      placeholder="Ingresa la cantidad de clases"
                    />
                    {formData.pack_id && (
                      <div className="form-text">
                        <small className="text-warning">
                          <i className="bi bi-exclamation-triangle me-1"></i>
                          Deshabilitado porque se seleccionó un paquete
                        </small>
                      </div>
                    )}
                    <div className="form-text">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Selecciona un paquete O ingresa cantidad de clases (no ambos)
                      </small>
                    </div>
                  </div>

                  {/* Disciplinas */}
                  <div className="col-md-6">
                     <label className="form-label fw-bold">
                       <i className="bi bi-trophy me-2"></i>
                       Disciplinas
                     </label>
                     <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                       {disciplinesLoading ? (
                         <div className="text-center">
                           <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                           <small className="text-muted">Cargando disciplinas...</small>
                         </div>
                       ) : (
                         <div className="row g-2">
                           {disciplines.map((discipline) => (
                             <div key={discipline.id} className="col-12">
                               <div className="form-check">
                                 <input
                                   className="form-check-input"
                                   type="checkbox"
                                   id={`discipline-${discipline.id}`}
                                   checked={formData.discipline_ids.includes(discipline.id)}
                                   onChange={(e) => handleDisciplineChange(discipline.id, e.target.checked)}
                                   disabled={disciplinesLoading}
                                 />
                                 <label className="form-check-label" htmlFor={`discipline-${discipline.id}`}>
                                   {discipline.name}
                                 </label>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                     <div className="form-text">
                       <small className="text-muted">
                         <i className="bi bi-info-circle me-1"></i>
                         Marca las disciplinas que deseas asignar al paquete
                       </small>
                     </div>
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