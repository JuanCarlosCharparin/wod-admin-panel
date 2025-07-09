import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import RegisterAdmin from '../pages/RegisterAdmin';
import Login from '../pages/Login';
//import Classes from '../pages/Classes';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/users" element={<Users />} />
      <Route path="/register-admin" element={<RegisterAdmin />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  </Router>
);

export default AppRoutes;
