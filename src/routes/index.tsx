import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
//import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import UserEdit from '../pages/UserEdit';
import RegisterAdmin from '../pages/RegisterAdmin';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UserDetail from '../pages/UserDetail';
import UserNewPack from '../pages/UserNewPack';
import Classes from '../pages/Classes';


const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute>
          <Users />
        </ProtectedRoute>
      } />
      <Route path="/users-edit/:id" element={
        <ProtectedRoute>
          <UserEdit />
        </ProtectedRoute>
      } />
      <Route path="/register-admin" element={
        <ProtectedRoute>
          <RegisterAdmin />
        </ProtectedRoute>
      } />  
      <Route path="/users-detail/:id" element={
        <ProtectedRoute>
          <UserDetail />
        </ProtectedRoute>
      } />
      <Route path="/users-newpack/:id" element={
        <ProtectedRoute>
          <UserNewPack />
        </ProtectedRoute>
      } />
      <Route path="/classes" element={
        <ProtectedRoute>
          <Classes />
        </ProtectedRoute>
      } />
    </Routes>
  </Router>
);

export default AppRoutes;
