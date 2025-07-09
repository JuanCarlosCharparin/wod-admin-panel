import { useEffect, useState } from 'react';
//import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

type User = {
  id: number;
  name: string;
  lastname: string;
  gender: string;
  phone: string
  email: string;
  dni: string;
  birth_date: string;
  gym: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
  };
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axiosInstance.get('http://localhost:8080/users') 
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Listado de Usuarios</h1>
      <table className="w-full table-auto bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Nombre</th>
            <th className="p-2">Apellido</th>
            <th className="p-2">Genero</th>
            <th className="p-2">Telefono</th>
            <th className="p-2">Email</th>
            <th className="p-2">DNI</th>
            <th className="p-2">Fecha Nacimiento</th>
            <th className="p-2">Gimnasio</th>
            <th className="p-2">Rol</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.lastname}</td>
              <td className="p-2">{user.gender}</td>
              <td className="p-2">{user.phone}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.dni}</td>
              <td className="p-2">{user.birth_date}</td>
              <td className="p-2">{user.gym?.name || '-'}</td>
              <td className="p-2">{user.role?.name || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;


