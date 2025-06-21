// src/pages/SuperVendorAllRoles.jsx
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';

const ALL_ROLES   = ['regional_vendor', 'driver'];
const ROLE_LABELS = {
  all:              'All Roles',
  regional_vendor:  'Regional Vendor',
//   city_vendor:      'City Vendor',
//   local_vendor:     'Local Vendor',
  driver:           'Driver',
};

export default function SuperVendorAllRoles() {
  const [users,     setUsers]     = useState([]);
  const [filter,    setFilter]    = useState('all');

  useEffect(() => {
    api.get('/users').then(res => {
      // exclude super_vendor
      setUsers(res.data.filter(u => u.role !== 'super_vendor'));
    });
  }, []);

  // Handle select‑to‑change Role dropdown
  const handleRoleChange = (userId, newRole) => {
    setUsers(us =>
      us.map(u =>
        u._id === userId
          ? { ...u, _pendingRole: newRole }
          : u
      )
    );
  };

  // Persist one user’s new role
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
              role:         u._pendingRole,
              _pendingRole: undefined,
            }
          : u
      )
    );
  };

  // Filtered list
  const displayed = users.filter(u =>
    filter === 'all' ? true : u.role === filter
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Manage User Roles</h1>

        {/* Role Filter */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Show role:</label>
          <select
            className="border rounded px-3 py-1"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {Object.entries(ROLE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

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
              {displayed.map(u => {
                const pending = u._pendingRole ?? u.role;
                return (
                  <tr key={u._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role.replace('_', ' ')}</td>
                    <td className="p-3">
                      <select
                        value={pending}
                        onChange={e =>
                          handleRoleChange(u._id, e.target.value)
                        }
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
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-4 text-center text-gray-500"
                  >
                    No users in this role.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
