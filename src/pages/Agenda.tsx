import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const diasOrden = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const Agenda = () => {
  const navigate = useNavigate();
  const [clasesPorDia, setClasesPorDia] = useState<Record<string, Clase[]>>({});
  const [loading, setLoading] = useState(true);
  const [fechasSemana, setFechasSemana] = useState<Record<string, string>>({});
  const [offsetSemanas, setOffsetSemanas] = useState(0);
  const { user: authUser } = useAuth();

  // Función para calcular las fechas de la semana según el offset
  const calcularFechasSemana = (offset: number) => {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Calcular el lunes de la semana actual
    const lunes = new Date(hoy);
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeLunes);
    
    // Aplicar el offset de semanas
    lunes.setDate(lunes.getDate() + (offset * 7));
    
    const fechas: Record<string, string> = {};
    
    diasOrden.forEach((dia, index) => {
      const fecha = new Date(lunes);
      fecha.setDate(lunes.getDate() + index);
      
      // Formatear fecha como DD/MM
      const diaFormateado = fecha.getDate().toString().padStart(2, '0');
      const mesFormateado = (fecha.getMonth() + 1).toString().padStart(2, '0');
      fechas[dia] = `${diaFormateado}/${mesFormateado}`;
    });
    
    setFechasSemana(fechas);
  };

  // Función para cambiar de semana
  const cambiarSemana = (nuevoOffset: number) => {
    setOffsetSemanas(nuevoOffset);
    setLoading(true);
  };

  // Función para formatear fecha en español
  const formatearFechaEspanol = (fecha: Date): string => {
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  // Función para formatear hora (HH:MM)
  const formatearHora = (tiempo: string): string => {
    try {
      // Si el tiempo viene como "08:00:00" o similar, extraer solo HH:MM
      const hora = tiempo.split(':');
      if (hora.length >= 2) {
        return `${hora[0].padStart(2, '0')}:${hora[1].padStart(2, '0')}`;
      }
      return tiempo; // Si no se puede parsear, devolver el original
    } catch (error) {
      return tiempo; // En caso de error, devolver el original
    }
  };

  // Función para obtener el título de la semana
  const obtenerTituloSemana = (): string => {
    if (Object.keys(fechasSemana).length === 0) return '';
    
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const lunes = new Date(hoy);
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    lunes.setDate(hoy.getDate() - diasDesdeLunes);
    
    // Aplicar el offset de semanas
    lunes.setDate(lunes.getDate() + (offsetSemanas * 7));
    
    // Calcular el domingo
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);
    
    const lunesFormateado = formatearFechaEspanol(lunes);
    const domingoFormateado = formatearFechaEspanol(domingo);
    
    return `Semana del ${lunesFormateado} al ${domingoFormateado}`;
  };

  useEffect(() => {
    calcularFechasSemana(offsetSemanas);
  }, [offsetSemanas]);

  useEffect(() => {
    const fetchClases = async () => {
      if (!authUser || !authUser.gym) return; 

      const gymId = authUser.gym.id;
      try {
        const { data } = await axios.get(`http://localhost:8080/classes/onWeek/gym/${gymId}?offset=${offsetSemanas}`);
        //console.log(data);
        // Verificar si hay clases o si es null
        if (data.classes === null) {
          setClasesPorDia({});
          setLoading(false);
          return;
        }
        
        // Agrupar por day_of_week
        const agrupadas = data.classes.reduce((acc: Record<string, Clase[]>, clase: Clase) => {
          //console.log('Procesando clase:', clase.day_of_week, clase);
          if (!acc[clase.day_of_week]) acc[clase.day_of_week] = [];
          acc[clase.day_of_week].push(clase);
          return acc;
        }, {});
        
        setClasesPorDia(agrupadas);
      } catch (error) {
        console.error('Error al obtener clases', error);
        setClasesPorDia({});
      } finally {
        setLoading(false);
      }
    };

    fetchClases();
  }, [offsetSemanas, authUser]);

  // Debug: monitorear cambios en el estado
  /*useEffect(() => {
    console.log('Estado clasesPorDia actualizado:', clasesPorDia);
    console.log('Claves en el estado:', Object.keys(clasesPorDia));
  }, [clasesPorDia]);*/

  if (loading) {
    return (
      <DashboardLayout>
        <p>Cargando agenda...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h1 className="card-title h3 fw-bold text-dark mb-0">
                  📅 Agenda de Clases
                </h1>
                <p className="text-muted mb-0 mt-2">
                  {obtenerTituloSemana()}
                </p>
              </div>
              <div>
                <button 
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => cambiarSemana(offsetSemanas - 1)}
                >
                  Semana anterior
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => cambiarSemana(0)}
                  disabled={offsetSemanas === 0}
                >
                  Semana actual
                </button>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => cambiarSemana(offsetSemanas + 1)}
                >
                  Semana siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendario semanal */}
        <div className="col-12">
          <div className="d-flex flex-wrap">
            {diasOrden.map((dia) => {
              //console.log(`Renderizando día ${dia}, clases disponibles:`, clasesPorDia[dia]);
              const tieneClases = clasesPorDia[dia]?.length > 0;
              
              return (
                <div
                  key={dia}
                  className={`border rounded p-2 m-1 shadow-sm ${
                    tieneClases ? 'bg-white' : 'bg-light'
                  }`}
                  style={{ minWidth: '180px', flex: '1' }}
                >
                  <h6 className={`fw-bold text-capitalize ${
                    tieneClases ? 'text-primary' : 'text-muted'
                  }`}>
                    {dia} {fechasSemana[dia]}
                  </h6>
                  {tieneClases ? (
                    clasesPorDia[dia].map((clase) => (
                      <div 
                        key={clase.id} 
                        className="p-2 mb-2 bg-light border rounded cursor-pointer hover-effect"
                        onClick={() => navigate(`/class-detail/${clase.id}`)}
                        style={{ cursor: 'pointer' }}
                        title="Haz clic para ver detalles de la clase"
                      >
                        <strong>{formatearHora(clase.time)} {clase.discipline.name}</strong>
                        <p className="mb-0">
                          {clase.enrolled} anotados<br />
                          {clase.vacancy} disponibles
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-muted small mb-0">
                        <i className="fas fa-calendar-times me-1"></i>
                        Sin clases programadas
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Mensaje cuando toda la semana está vacía */}
          {Object.keys(clasesPorDia).length === 0 && !loading && (
            <div className="text-center py-5">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <i className="fas fa-calendar-week fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">Esta semana no tiene clases programadas</h5>
                  <p className="text-muted mb-0">
                    No hay clases agendadas para la semana del {fechasSemana['Lunes']} al {fechasSemana['Domingo']}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Agenda;
