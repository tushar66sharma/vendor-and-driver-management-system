// src/pages/SuperVendorAllRoles.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';

const ALL_ROLES = [
  'regional_vendor',
  'city_vendor',
  'local_vendor',
  'driver',
];

export default function SuperVendorAllRoles() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users').then(res => {
      setUsers(res.data.filter(u => u.role !== 'super_vendor'));
    });
  }, []);

  // Track edits locally
  const handleRoleChange = (userId, newRole) => {
    setUsers(us =>
      us.map(u =>
        u._id === userId
          ? { ...u, _pendingRole: newRole }
          : u
      )
    );
  };

  // Persist one user’s role
  const saveRole = async userId => {
    const user = users.find(u => u._id === userId);
    if (!user || user._pendingRole == null) return;

    await api.patch(`/users/${userId}/role`, { role: user._pendingRole });

    // Commit locally
    setUsers(us =>
      us.map(u =>
        u._id === userId
          ? { 
              ...u,
              role: u._pendingRole,
              _pendingRole: undefined
            }
          : u
      )
    );
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Manage User Roles</h1>
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Current Role</th>
                <th className="p-3 text-left">Change To</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const pending = u._pendingRole ?? u.role;
                return (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.firstName} {u.lastName}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      <select
                        value={pending}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="border rounded px-2 py-1"
                      >
                        {ALL_ROLES.map(r => (
                          <option key={r} value={r}>
                            {r.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => saveRole(u._id)}
                        disabled={pending === u.role}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
