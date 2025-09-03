// src/pages/Dashboard.tsx
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Función para obtener el nombre de saludo
  const getGreetingName = () => {
    if (!user) return 'Usuario';
    return user.name || 'Usuario';
  };

  const dashboardCards = [
    {
      title: 'Socios',
      description: 'Gestionar usuarios del sistema',
      icon: '👥',
      path: '/users',
      color: 'bg-primary',
      textColor: 'text-white'
    },
    {
      title: 'Agenda',
      description: 'Gestionar horarios y eventos',
      icon: '📅',
      path: '/agenda',
      color: 'bg-info',
      textColor: 'text-white'
    },
    {
      title: 'Carga masiva de clases',
      description: 'Sube varias clases de manera rápida y sencilla',
      icon: '🏋️',
      path: '/clases',
      color: 'bg-secondary',
      textColor: 'text-white'
    }
  ];

  return (
    <DashboardLayout>
      <div className="row g-4">
        {/* Header */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h1 className="card-title h3 fw-bold text-dark">
                ¡Bienvenido, {getGreetingName()}!
              </h1>
              <p className="card-text text-muted">
                Panel de administración de {user?.gym?.name || 'Gimnasio'} - {user?.role?.name || 'Usuario'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="col-12">
          <div className="row g-4">
            {dashboardCards.map((card, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-3">
                <div
                  onClick={() => navigate(card.path)}
                  className={`card ${card.color} ${card.textColor} shadow-sm h-100 cursor-pointer`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div>
                      <h5 className="card-title fw-bold mb-1">{card.title}</h5>
                      <p className="card-text small opacity-75">{card.description}</p>
                    </div>
                    <span className="fs-1">{card.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title h5 fw-bold text-dark mb-4">Acciones Rápidas</h2>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <button
                    onClick={() => navigate('/users')}
                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <span className="fs-4 me-3">👥</span>
                    <span className="fw-medium">Ver Usuarios</span>
                  </button>
                </div>
                <div className="col-12 col-md-4">
                  <button
                    onClick={() => navigate('/users')}
                    className="btn btn-outline-success w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <span className="fs-4 me-3">➕</span>
                    <span className="fw-medium">Nuevo Usuario</span>
                  </button>
                </div>
                <div className="col-12 col-md-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-outline-info w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <span className="fs-4 me-3">📊</span>
                    <span className="fw-medium">Estadísticas</span>
                  </button>
                </div>
                <div className="col-12 col-md-4">
                  <button
                    onClick={() => navigate('/classes')}
                    className="btn btn-outline-warning w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <span className="fs-4 me-3">🏋️</span>
                    <span className="fw-medium">Carga masiva de clases</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
