import React from 'react';
//import logo from './logo.svg';
import './App.css';
import AppRoutes from './routes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-vh-100 bg-light">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
