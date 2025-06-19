// src/pages/SuperVendorAllUsers.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';

export default function SuperVendorAllUsers() {
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState([]);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data));
    api.get('/permissions').then(r => setPerms(r.data));
  }, []);

  // Toggle locally
  const togglePerm = (userId, permName, enabled) => {
    setUsers(list =>
      list.map(u =>
        u._id === userId
          ? {
              ...u,
              customPermissions: enabled
                ? [...u.customPermissions, permName]
                : u.customPermissions.filter(p => p !== permName),
            }
          : u
      )
    );
  };

  // Save one user
  const saveUser = async (userId) => {
    const user = users.find(u => u._id === userId);
    await api.patch(`/users/${userId}/permissions`, {
      customPermissions: user.customPermissions,
    });
    // Optionally re‑fetch or show a toast
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">All Users & Permissions</h1>
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Role</th>
                {perms.map(p => (
                  <th key={p.permissionName} className="p-3 text-center">
                    {p.permissionName}
                  </th>
                ))}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{user.firstName} {user.lastName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>

                  {perms.map(p => {
                    const isChecked = user.customPermissions.includes(p.permissionName);
                    return (
                      <td key={p.permissionName} className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e =>
                            togglePerm(user._id, p.permissionName, e.target.checked)
                          }
                        />
                      </td>
                    );
                  })}

                  <td className="p-3 text-center">
                    <button
                      onClick={() => saveUser(user._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
