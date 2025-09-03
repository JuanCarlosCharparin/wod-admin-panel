import { useEffect, useState, useCallback} from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import axios from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Template } from '../types/classes/templates';

const CargaMasivaClases = () => {
  useParams();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [, setDisciplinas] = useState<string[]>([]);
  const [disciplinasCompletas, setDisciplinasCompletas] = useState<any[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string>('Lunes');
  
  // Estado para el formulario de nuevo bloque
  const [nuevoBloque, setNuevoBloque] = useState({
    dia: 'Lunes',
    start_time: '',
    end_time: '',
    capacity: '',
    discipline_id: ''
  });
  const [enviando, setEnviando] = useState(false);

  // Estado para edición de bloques
  const [editandoBloque, setEditandoBloque] = useState<number | null>(null);
  const [bloqueEditado, setBloqueEditado] = useState({
    start_time: '',
    end_time: '',
    capacity: '',
    discipline_id: ''
  });
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [editLoading, setEditLoading] = useState<number | null>(null);

  // Estado para el generador de clases
  const [generarClases, setGenerarClases] = useState({
    from: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    to: ''
  });
  const [generandoClases, setGenerandoClases] = useState(false);

  // Días de la semana
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para obtener el template_id del día seleccionado
  const obtenerTemplateId = (dia: string): number | null => {
    const template = templates.find((t: Template) => t.day === dia);
    return template ? template.id : null;
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNuevoBloque(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en el formulario de generar clases
  const handleGenerarClasesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGenerarClases(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para generar clases desde las plantillas
  const handleGenerarClases = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser?.gym) {
      alert('Error: No se pudo obtener información del gimnasio');
      return;
    }

    // Validar campos requeridos
    if (!generarClases.from || !generarClases.to) {
      alert('Por favor selecciona las fechas de inicio y fin');
      return;
    }

    // Validar que la fecha de fin sea posterior a la de inicio
    if (new Date(generarClases.to) <= new Date(generarClases.from)) {
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setGenerandoClases(true);
      
      const generateData = {
        gym_id: authUser.gym.id,
        from: generarClases.from,
        to: generarClases.to
      };
      
      await axios.post('http://localhost:8080/generate-classes', generateData);
      
      alert(`¡Clases generadas exitosamente desde ${generarClases.from} hasta ${generarClases.to}!`);
      
      // Limpiar formulario
      setGenerarClases({
        from: new Date().toISOString().split('T')[0],
        to: ''
      });
      
    } catch (error: any) {
      console.error('Error generando clases:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Error desconocido al generar las clases';
      
      alert(`Error al generar las clases: ${errorMessage}`);
    } finally {
      setGenerandoClases(false);
    }
  };

  // Función para eliminar un bloque
  const handleEliminarBloque = async (blockId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este bloque?')) {
      return;
    }

    try {
      setDeleteLoading(blockId);
      await axios.delete(`http://localhost:8080/schedule-blocks/${blockId}`);
      
      // Recargar los templates para mostrar los cambios
      await fetchTemplates();
      
      alert('¡Bloque eliminado exitosamente!');
      
    } catch (error) {
      console.error('Error eliminando bloque:', error);
      alert('Error al eliminar el bloque. Revisa la consola para más detalles.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Función para iniciar la edición de un bloque
  const handleIniciarEdicion = (block: any) => {
    setEditandoBloque(block.id);
    setBloqueEditado({
      start_time: block.start_time.substring(0, 5), // Formato HH:MM
      end_time: block.end_time.substring(0, 5), // Formato HH:MM
      capacity: block.capacity.toString(),
      discipline_id: block.discipline.id.toString()
    });
  };

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setEditandoBloque(null);
    setBloqueEditado({
      start_time: '',
      end_time: '',
      capacity: '',
      discipline_id: ''
    });
  };

  // Función para manejar cambios en el formulario de edición
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBloqueEditado(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para guardar los cambios de edición
  const handleGuardarEdicion = async (blockId: number) => {
    // Validar campos requeridos
    if (!bloqueEditado.start_time || !bloqueEditado.end_time || !bloqueEditado.capacity || !bloqueEditado.discipline_id) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setEditLoading(blockId);
      
      // Obtener el template_id del día seleccionado (igual que en la creación)
      const templateId = obtenerTemplateId(diaSeleccionado);
      if (!templateId) {
        alert('Error: No se pudo encontrar el template para el día seleccionado');
        return;
      }

      const bloqueData = {
        template_id: templateId,
        start_time: `${bloqueEditado.start_time}:00`, // Agregar segundos si es necesario
        end_time: `${bloqueEditado.end_time}:00`, // Agregar segundos si es necesario
        capacity: parseInt(bloqueEditado.capacity),
        discipline_id: parseInt(bloqueEditado.discipline_id)
      };
      
      await axios.put(`http://localhost:8080/schedule-blocks/${blockId}`, bloqueData);
      
      // Cancelar edición y recargar templates
      handleCancelarEdicion();
      await fetchTemplates();
      
      alert('¡Bloque actualizado exitosamente!');
      
    } catch (error: any) {
      console.error('Error actualizando bloque:', error);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message || 
                          'Error desconocido al actualizar el bloque';
      
      alert(`Error al actualizar el bloque: ${errorMessage}`);
    } finally {
      setEditLoading(null);
    }
  };

  // Función para enviar el nuevo bloque
  const handleSubmitBloque = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser?.gym) {
      alert('Error: No se pudo obtener información del gimnasio');
      return;
    }

    // Validar campos requeridos
    if (!nuevoBloque.start_time || !nuevoBloque.end_time || !nuevoBloque.capacity || !nuevoBloque.discipline_id) {
      alert('Por favor completa todos los campos');
      return;
    }

    // Obtener el template_id del día seleccionado
    const templateId = obtenerTemplateId(nuevoBloque.dia);
    if (!templateId) {
      alert('Error: No se pudo encontrar el template para el día seleccionado');
      return;
    }

    try {
      setEnviando(true);
      
      const bloqueData = {
        template_id: templateId,
        start_time: nuevoBloque.start_time,
        end_time: nuevoBloque.end_time,
        capacity: parseInt(nuevoBloque.capacity),
        discipline_id: parseInt(nuevoBloque.discipline_id)
      };
      
      await axios.post('http://localhost:8080/schedule-block', bloqueData);
      
      // Limpiar formulario
      setNuevoBloque({
        dia: diaSeleccionado, // Mantener el día actual
        start_time: '',
        end_time: '',
        capacity: '',
        discipline_id: ''
      });
      
      // Recargar los templates para mostrar el nuevo bloque
      await fetchTemplates();
      
      alert('¡Bloque creado exitosamente!');
      
    } catch (error) {
      console.error('Error creando bloque:', error);
      alert('Error al crear el bloque. Revisa la consola para más detalles.');
    } finally {
      setEnviando(false);
    }
  };

  // Función para recargar templates (extraída del useEffect)
  const fetchTemplates = useCallback(async () => {
    if (!authUser || !authUser.gym) return; 

    const gymId = authUser.gym.id;

    try {
      setLoading(true);
      
      const response = await axios.get(`http://localhost:8080/templates/gym/${gymId}`);
      
      // Verificar que response.data existe y es un array
      if (response.data && Array.isArray(response.data)) {
        setTemplates(response.data);

        // Extraer disciplinas únicas (nombres)
        const disciplinasUnicas = Array.from(new Set(
          response.data.flatMap((template: Template) =>
            template.blocks?.map((block) => block.discipline.name) || []
          )
        )) as string[];

        setDisciplinas(disciplinasUnicas);

      } else {
        setTemplates([]);
        setDisciplinas([]);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      console.error('Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      setTemplates([]);
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // Función para obtener disciplinas del gimnasio
  const fetchDisciplinas = useCallback(async () => {
    if (!authUser?.gym) return;

    const gymId = authUser.gym.id;

    try {
      const response = await axios.get(`http://localhost:8080/disciplines/gym/${gymId}`);
      
      if (response.data && Array.isArray(response.data)) {
        setDisciplinasCompletas(response.data);
      }
    } catch (error) {
      console.error('Error fetching disciplinas:', error);
    }
  }, [authUser]);

  useEffect(() => {
    fetchTemplates();
    fetchDisciplinas();
  }, [fetchTemplates, fetchDisciplinas]);

  // Sincronizar el día del formulario con el día seleccionado
  useEffect(() => {
    setNuevoBloque(prev => ({
      ...prev,
      dia: diaSeleccionado
    }));
  }, [diaSeleccionado]);

  return (
    <DashboardLayout>
      <div className="row g-4">
        {/* Título */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h1 className="card-title h3 fw-bold text-dark mb-0">
                  📋 Carga Masiva de Clases
                </h1>
                <p className="text-muted mb-0 mt-2">
                  Gestiona y configura las clases de tu gimnasio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de día */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h5 className="card-title mb-0">
                    <i className="fas fa-calendar-week me-2"></i>
                    Clases por Día
                  </h5>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 align-items-center justify-content-end">
                    {/* Navegación rápida */}
                    <div className="btn-group me-3" role="group">
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          const currentIndex = diasSemana.indexOf(diaSeleccionado);
                          const prevIndex = currentIndex > 0 ? currentIndex - 1 : diasSemana.length - 1;
                          setDiaSeleccionado(diasSemana[prevIndex]);
                        }}
                        title="Día anterior"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          const currentIndex = diasSemana.indexOf(diaSeleccionado);
                          const nextIndex = currentIndex < diasSemana.length - 1 ? currentIndex + 1 : 0;
                          setDiaSeleccionado(diasSemana[nextIndex]);
                        }}
                        title="Día siguiente"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </div>
                    
                    {/* Selector de día */}
                    <label className="form-label mb-0 fw-medium">Día:</label>
                    <select 
                      className="form-select w-auto" 
                      value={diaSeleccionado}
                      onChange={(e) => setDiaSeleccionado(e.target.value)}
                    >
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>
                          {dia}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vista del día seleccionado */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </div>
                  <p className="mt-3 text-muted">Cargando templates...</p>
                </div>
              ) : (() => {
                // Buscar el template del día seleccionado
                const template = templates.find((t: Template) => t.day === diaSeleccionado);
                
                if (!template || !template.blocks || template.blocks.length === 0) {
                  return (
                    <div className="text-center py-5">
                      <i className="fas fa-calendar-day text-muted" style={{ fontSize: '3rem' }}></i>
                      <h5 className="mt-3 text-muted">No hay clases configuradas para {diaSeleccionado}</h5>
                      <p className="text-muted">
                        Selecciona otro día o agrega nuevas clases para este día
                      </p>
                    </div>
                  );
                }

                return (
                  <div>
                    {/* Encabezado del día seleccionado */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="fw-bold text-dark mb-0">
                        <i className="fas fa-calendar-day me-2"></i>
                        {diaSeleccionado}
                      </h5>
                      <span className="badge bg-primary fs-6">
                        {template.blocks.length} clase{template.blocks.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-light">
                          <tr>
                            <th>Hora</th>
                            <th>Disciplina</th>
                            <th>Capacidad</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {template.blocks.map((block: any) => (
                            <tr key={`${diaSeleccionado}-${block.id}`}>
                              {editandoBloque === block.id ? (
                                // Modo edición
                                <>
                                  <td>
                                    <div className="row g-2">
                                      <div className="col-6">
                                        <input 
                                          type="time" 
                                          className="form-control form-control-sm" 
                                          name="start_time"
                                          value={bloqueEditado.start_time}
                                          onChange={handleEditInputChange}
                                        />
                                      </div>
                                      <div className="col-6">
                                        <input 
                                          type="time" 
                                          className="form-control form-control-sm" 
                                          name="end_time"
                                          value={bloqueEditado.end_time}
                                          onChange={handleEditInputChange}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <select 
                                      className="form-select form-select-sm"
                                      name="discipline_id"
                                      value={bloqueEditado.discipline_id}
                                      onChange={handleEditInputChange}
                                    >
                                      {disciplinasCompletas.map(disciplina => (
                                        <option key={disciplina.id} value={disciplina.id}>
                                          {disciplina.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td>
                                    <input 
                                      type="number" 
                                      className="form-control form-control-sm" 
                                      name="capacity"
                                      value={bloqueEditado.capacity}
                                      onChange={handleEditInputChange}
                                      min="1"
                                      style={{ width: '80px' }}
                                    />
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-2">
                                      <button 
                                        className="btn btn-outline-success btn-sm" 
                                        title="Guardar"
                                        onClick={() => handleGuardarEdicion(block.id)}
                                        disabled={editLoading === block.id}
                                      >
                                        {editLoading === block.id ? (
                                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                          <i className="bi bi-check"></i>
                                        )}
                                      </button>
                                      <button 
                                        className="btn btn-outline-secondary btn-sm" 
                                        title="Cancelar"
                                        onClick={handleCancelarEdicion}
                                        disabled={editLoading === block.id}
                                      >
                                        <i className="bi bi-x"></i>
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                // Modo visualización
                                <>
                                  <td className="fw-medium">
                                    {block.start_time.substring(0, 5)} - {block.end_time.substring(0, 5)}
                                  </td>
                                  <td>
                                    <span className="badge bg-primary">
                                      {block.discipline.name}
                                    </span>
                                  </td>
                                  <td>
                                    <span className="badge bg-success">
                                      {block.capacity} personas
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex justify-content-center gap-2">
                                      <button 
                                        className="btn btn-outline-primary btn-sm" 
                                        title="Editar"
                                        onClick={() => handleIniciarEdicion(block)}
                                        disabled={deleteLoading === block.id}
                                      >
                                        <i className="bi bi-pencil"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-danger btn-sm" 
                                        title="Eliminar"
                                        onClick={() => handleEliminarBloque(block.id)}
                                        disabled={deleteLoading === block.id}
                                      >
                                        {deleteLoading === block.id ? (
                                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                          <i className="bi bi-trash"></i>
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Formulario para agregar nuevo bloque */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Nuevo Bloque
              </h5>
              <form onSubmit={handleSubmitBloque}>
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label">Día</label>
                    <select 
                      className="form-select" 
                      name="dia"
                      value={nuevoBloque.dia}
                      onChange={handleInputChange}
                    >
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>
                          {dia}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Hora inicio</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      name="start_time"
                      value={nuevoBloque.start_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Hora fin</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      name="end_time"
                      value={nuevoBloque.end_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Disciplina</label>
                    <select 
                      className="form-select"
                      name="discipline_id"
                      value={nuevoBloque.discipline_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Seleccionar</option>
                      {disciplinasCompletas.map(disciplina => (
                        <option key={disciplina.id} value={disciplina.id}>
                          {disciplina.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Capacidad</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      name="capacity"
                      value={nuevoBloque.capacity}
                      onChange={handleInputChange}
                      min="1" 
                      placeholder="20"
                      required
                    />
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button 
                      type="submit"
                      className="btn btn-success btn-sm w-100"
                      disabled={enviando}
                    >
                      {enviando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Creando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-1"></i>
                          Agregar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>


        {/* Generador de Clases */}
        <div className="col-12">
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <h5 className="card-title mb-3 text-warning">
                <i className="bi bi-calendar-plus me-2"></i>
                Generar Clases en la Agenda
              </h5>
              <p className="text-muted mb-3">
                Genera clases reales en la agenda basadas en las plantillas configuradas para un rango de fechas específico.
              </p>
              <form onSubmit={handleGenerarClases}>
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label">Fecha de inicio</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="from"
                      value={generarClases.from}
                      onChange={handleGenerarClasesChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Fecha de fin</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      name="to"
                      value={generarClases.to}
                      onChange={handleGenerarClasesChange}
                      min={generarClases.from}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <button 
                      type="submit"
                      className="btn btn-warning w-100"
                      disabled={generandoClases}
                    >
                      {generandoClases ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Generando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-plus me-1"></i>
                          Generar Clases
                        </>
                      )}
                    </button>
                  </div>
                  <div className="col-md-3">
                    <div className="text-muted small">
                      <i className="bi bi-info-circle me-1"></i>
                      Se crearán clases para todos los días en el rango seleccionado
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

export default CargaMasivaClases;
