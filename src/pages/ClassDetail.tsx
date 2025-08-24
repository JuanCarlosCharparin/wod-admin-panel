import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface Clase {
  id: number;
  date: string;
  time: string;
  day_of_week: string;
  capacity: number;
  enrolled: number;
  vacancy: number;
  gym: { id: number; name: string };
  discipline: { id: number; name: string };
}

interface Inscripto {
  id: number;
  user: {
    id: number;
    name: string;
    lastname: string;
    dni: string;
  };
  class: {
    id: number;
    date: string;
    time: string;
    capacity: number;
    gym: { id: number; name: string };
    discipline: { id: number; name: string };
  };
  status: string;
  reserved: string;
}

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [clase, setClase] = useState<Clase | null>(null);
  const [inscriptos, setInscriptos] = useState<Inscripto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClase = async () => {
      if (!id || !authUser) return;

      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:8080/classes/${id}`);
        setClase(data);
        setError(null);
      } catch (err: any) {
        console.error('Error al obtener la clase:', err);
        setError(err.response?.data?.message || 'Error al cargar la clase');
      } finally {
        setLoading(false);
      }
    };

    const fetchInscriptos = async () => {
      if (!id || !authUser) return;

      try {
        const { data } = await axios.get(`http://localhost:8080/calendar/info-class/${id}`);
        console.log(data);
        setInscriptos(data);
      } catch (err: any) {
        console.error('Error al obtener los inscriptos:', err);
      }
    };

    fetchClase();
    fetchInscriptos();
  }, [id, authUser]);

  const formatearHora = (tiempo: string): string => {
    try {
      const hora = tiempo.split(':');
      if (hora.length >= 2) {
        return `${hora[0].padStart(2, '0')}:${hora[1].padStart(2, '0')}`;
      }
      return tiempo;
    } catch (error) {
      return tiempo;
    }
  };

  const formatearFecha = (fecha: string): string => {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return fecha;
    }
  };

  const formatearFechaReserva = (fechaReserva: string): string => {
    try {
      const date = new Date(fechaReserva);
      const dia = date.getDate().toString().padStart(2, '0');
      const mes = (date.getMonth() + 1).toString().padStart(2, '0');
      const hora = date.getHours().toString().padStart(2, '0');
      const minutos = date.getMinutes().toString().padStart(2, '0');
      
      return `reservado el ${dia}/${mes} a las ${hora}:${minutos}`;
    } catch (error) {
      return 'fecha no disponible';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !clase) {
    return (
      <DashboardLayout>
        <div className="text-center py-5">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
              <h5 className="text-warning">Error al cargar la clase</h5>
              <p className="text-muted mb-3">
                {error || 'No se pudo cargar la información de la clase'}
              </p>
              <button 
                className="btn btn-primary me-2"
                onClick={() => navigate('/agenda')}
              >
                Volver a Agenda
              </button>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          </div>
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h1 className="card-title h3 fw-bold text-dark mb-0">
                    📚 Detalles de la Clase
                  </h1>
                  <p className="text-muted mb-0 mt-2">
                    Información completa de la clase seleccionada
                  </p>
                </div>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/agenda')}
                >
                  ← Volver a Agenda
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="row g-4">
            {/* Información principal de la clase */}
            <div className="col-md-8">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h4 className="card-title text-primary mb-4">
                    {clase.discipline.name}
                  </h4>
                  
                  <div className="row align-items-center mb-3">
                    <div className="col-md-6">
                      <strong className="h5">{formatearFecha(clase.date) + ' ' + formatearHora(clase.time) + ' horas'}</strong>
                    </div>
                    <div className="col-md-6">
                      <div className="row g-2 text-center">
                        <div className="col-4">
                          <h4 className="text-primary fw-bold mb-1">{clase.capacity}</h4>
                          <small className="text-muted">Capacidad</small>
                        </div>
                        <div className="col-4">
                          <h4 className="text-success fw-bold mb-1">
                            {inscriptos.filter(inscripto => inscripto.status === 'inscripto').length}
                          </h4>
                          <small className="text-muted">Presentes</small>
                        </div>
                        <div className="col-4">
                          <h4 className="text-warning fw-bold mb-1">
                            {inscriptos.filter(inscripto => inscripto.status === 'ausente').length}
                          </h4>
                          <small className="text-muted">Ausentes</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de alumnos inscritos */}
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title text-primary mb-3">
                    👥 Alumnos Inscriptos
                  </h5>
                  
                  {inscriptos.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="fas fa-users fa-2x text-muted mb-3"></i>
                      <p className="text-muted mb-0">No hay alumnos inscritos</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {inscriptos.map((inscripto) => (
                        <div 
                          key={inscripto.id} 
                          className={`card border-0 ${
                            inscripto.status === 'inscripto' 
                              ? 'bg-success bg-opacity-10 border-success' 
                              : 'bg-warning bg-opacity-10 border-warning'
                          }`}
                        >
                          <div className="card-body py-2 px-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-grow-1">
                                <h6 className="mb-0 fw-semibold">
                                  {inscripto.user.name} {inscripto.user.lastname}
                                </h6>
                                <small className={`badge ${
                                  inscripto.status === 'inscripto' 
                                    ? 'bg-success' 
                                    : 'bg-warning'
                                } text-white`}>
                                  {inscripto.status === 'inscripto' ? 'Presente' : 'Ausente'}
                                </small>
                                
                              </div>
                              <small className="text-muted">
                                {inscripto.reserved ? formatearFechaReserva(inscripto.reserved) : ''}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <button className="btn btn-outline-secondary" onClick={() => navigate('/agenda')}>
                  <i className="fas fa-arrow-left me-2"></i>
                  Volver a Agenda
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClassDetail;