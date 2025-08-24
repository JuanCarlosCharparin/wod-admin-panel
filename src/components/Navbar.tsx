import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/users', label: 'Socios', icon: '👥' },
    { path: '/classes', label: 'Clases', icon: '🏋️' },
  ];

  // Función para obtener el nombre completo del usuario
  const getUserFullName = () => {
    if (!user) return 'Administrador';
    
    const firstName = user.name || '';
    
    if (firstName) {
      return `${firstName}`;
    } else {
      return 'Usuario';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className="d-none d-lg-block position-fixed top-0 start-0 h-100 text-dark" style={{ width: '280px', zIndex: 1000, backgroundColor: '#e3f2fd' }}>
        <div className="d-flex flex-column h-100">
          {/* Logo */}
          <div className="p-4 border-bottom border-secondary">
            <h4 className="fw-bold text-dark mb-0">{user?.gym?.name}</h4>
          </div>

          {/* User Info */}
          <div className="p-4 border-bottom border-secondary">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                <span className="fw-bold text-white">👤</span>
              </div>
              <div>
                <div className="fw-medium text-dark">{getUserFullName()}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow-1 p-3">
            <ul className="nav flex-column">
              {navItems.map((item) => (
                <li className="nav-item mb-2" key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`nav-link w-100 text-start border-0 rounded ${isActive(item.path) ? 'bg-primary text-white' : 'text-dark hover-bg-secondary'}`}
                    style={{ 
                      background: isActive(item.path) ? '' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span className="me-3">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-3 border-top border-secondary">
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>


    </>
  );
};

export default Navbar; 