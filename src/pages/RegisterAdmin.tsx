import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    gender: '',
    phone: '',
    email: '',
    movil_phone: '',
    birth_date: '',
    dni: '',
    password: '',
    gym_id: '',
  });

  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/gyms')
      .then(res => setGyms(res.data))
      .catch(err => console.error('Error al cargar gimnasios:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const payload = {
      ...formData,
      role_id: 2, // Asignar rol admin directamente
      gym_id: parseInt(formData.gym_id)
    };

    try {
      await axios.post('http://localhost:8080/register', payload);
      setSuccess(true);
      setFormData({
        name: '',
        lastname: '',
        gender: '',
        phone: '',
        email: '',
        movil_phone: '',
        birth_date: '',
        dni: '',
        password: '',
        gym_id: '',
      });
    } catch (err) {
      console.error(err);
      alert('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row g-4">
        {/* Header */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title h3 fw-bold text-dark">Registrar Administrador</h1>
              <p className="card-text text-muted">Crea una nueva cuenta de administrador</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="col-12">
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              ✅ Administrador registrado con éxito
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
                    <label className="form-label fw-medium">Nombre</label>
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
                    <label className="form-label fw-medium">Apellido</label>
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
                    <label className="form-label fw-medium">Género</label>
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
                    <label className="form-label fw-medium">Teléfono</label>
                    <input 
                      type="text" 
                      name="phone" 
                      className="form-control" 
                      value={formData.phone} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Móvil</label>
                    <input 
                      type="text" 
                      name="movil_phone" 
                      className="form-control" 
                      value={formData.movil_phone} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">DNI</label>
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
                    <label className="form-label fw-medium">Email</label>
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
                    <label className="form-label fw-medium">Contraseña</label>
                    <input 
                      type="password" 
                      name="password" 
                      className="form-control" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-medium">Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      name="birth_date" 
                      className="form-control" 
                      value={formData.birth_date} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-medium">Gimnasio</label>
                    <select 
                      name="gym_id" 
                      className="form-select" 
                      value={formData.gym_id} 
                      onChange={handleChange} 
                      required
                    >
                      <option value="">Seleccionar gimnasio</option>
                      {gyms.map((gym: any) => (
                        <option key={gym.id} value={gym.id}>{gym.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <div className="d-flex justify-content-end">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary px-4 py-2"
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Registrando...
                          </>
                        ) : (
                          'Registrar Administrador'
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

export default RegisterAdmin;