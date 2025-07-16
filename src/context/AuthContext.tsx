import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  lastname: string; 
  email: string;
  gym?: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Función para normalizar los datos del usuario
const normalizeUserData = (userData: any): User => {
  return {
    id: userData.id,
    name: userData.name || userData.first_name || '',
    lastname: userData.lastname || userData.last_name || userData.surname || '',
    email: userData.email,
    gym: userData.gym,
    role: userData.role || {
      id: userData.role_id || 0,
      name: userData.role_name || 'Usuario'
    }
  };
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario está autenticado al cargar la app
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Configurar el token en axios para futuras peticiones
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Obtener información del usuario actual
        const response = await axios.get('http://localhost:8080/me');
        console.log('🔍 DATOS DEL USUARIO AUTENTICADO (/me):', response.data);
        console.log('🏢 GIMNASIO:', response.data.gym);
        console.log('👤 ROL:', response.data.role);
        
        const normalizedUser = normalizeUserData(response.data);
        setUser(normalizedUser);
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        // Si hay error, limpiar el token y el usuario
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8080/login', {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      // Guardar token
      localStorage.setItem('token', token);
      
      // Configurar token en axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Normalizar y guardar información del usuario
      const normalizedUser = normalizeUserData(userData);
      setUser(normalizedUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 