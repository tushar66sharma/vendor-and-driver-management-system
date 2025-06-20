// src/pages/SuperVendorAllUsers.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function SuperVendorAllUsers() {
  const [users, setUsers]           = useState([]);
  const [perms, setPerms]           = useState([]);
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // fetch users & master permissions
    api.get("/users").then((r) => setUsers(r.data));
    api.get("/permissions").then((r) => setPerms(r.data));
  }, []);

  // Map roles to user‐friendly labels
  const ROLE_LABELS = {
    all:              "All Roles",
    super_vendor:     "Super Vendors",
    regional_vendor:  "Regional Vendors",
    // city_vendor:      "City Vendors",
    // local_vendor:     "Local Vendors",
    driver:           "Drivers",
  };

  // Apply role filter
  const displayed = users.filter((u) =>
    filterRole === "all" ? true : u.role === filterRole
  );

  // Toggle permission checkbox in local state
  const togglePerm = (userId, permName, enabled) => {
    setUsers((list) =>
      list.map((u) =>
        u._id === userId
          ? {
              ...u,
              customPermissions: enabled
                ? [...u.customPermissions, permName]
                : u.customPermissions.filter((p) => p !== permName),
            }
          : u
      )
    );
  };

  // Persist one user’s permissions
  const saveUser = async (userId) => {
    const user = users.find((u) => u._id === userId);
    await api.patch(`/users/${userId}/permissions`, {
      customPermissions: user.customPermissions,
    });
    // You could show a toast here if you like
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">All Users & Permissions</h1>

        {/* Role Filter */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Filter by role:</label>
          <select
            className="border rounded px-3 py-1"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
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
                <th className="p-3 text-left">Role</th>
                {perms.map((p) => (
                  <th key={p.permissionName} className="p-3 text-center">
                    {p.permissionName}
                  </th>
                ))}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>

                  {perms.map((p) => {
                    const isChecked = user.customPermissions.includes(
                      p.permissionName
                    );
                    return (
                      <td
                        key={p.permissionName}
                        className="p-3 text-center"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            togglePerm(
                              user._id,
                              p.permissionName,
                              e.target.checked
                            )
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
              {displayed.length === 0 && (
                <tr>
                  <td
                    colSpan={3 + perms.length + 1}
                    className="p-4 text-center text-gray-500"
                  >
                    No users match this role.
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
