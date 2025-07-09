import { useState, useEffect } from 'react';
import axios from 'axios';

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

  useEffect(() => {
    axios.get('http://localhost:8080/gyms')
      .then(res => setGyms(res.data))
      .catch(err => console.error('Error al cargar gimnasios:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      role_id: 2, // Asignar rol admin directamente
      gym_id: parseInt(formData.gym_id)
    };

    axios.post('http://localhost:8080/register', payload)
      .then(() => {
        alert('Administrador registrado con éxito');
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
      })
      .catch(err => {
        console.error(err);
        alert('Error al registrar usuario');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Administrador</h2>
      <form onSubmit={handleSubmit} className="row g-3">

        <div className="col-md-6">
          <label className="form-label">Nombre</label>
          <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Apellido</label>
          <input type="text" name="lastname" className="form-control" value={formData.lastname} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Género</label>
          <input type="text" name="gender" className="form-control" value={formData.gender} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Teléfono</label>
          <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Móvil</label>
          <input type="text" name="movil_phone" className="form-control" value={formData.movil_phone} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">DNI</label>
          <input type="text" name="dni" className="form-control" value={formData.dni} onChange={handleChange} required />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Contraseña</label>
          <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Fecha de Nacimiento</label>
          <input type="date" name="birth_date" className="form-control" value={formData.birth_date} onChange={handleChange} />
        </div>

        <div className="col-md-6">
          <label className="form-label">Gimnasio</label>
          <select name="gym_id" className="form-select" value={formData.gym_id} onChange={handleChange} required>
            <option value="">Seleccionar gimnasio</option>
            {gyms.map((gym: any) => (
              <option key={gym.id} value={gym.id}>{gym.name}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary">Registrar</button>
        </div>

      </form>
    </div>
  );
};

export default RegisterAdmin;