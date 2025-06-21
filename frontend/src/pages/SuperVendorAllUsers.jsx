// src/pages/SuperVendorAllUsers.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function SuperVendorAllUsers() {
  const [users, setUsers] = useState([]);
  const [perms, setPerms] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [notification, setNotification] = useState({ msg: "", color: "" });

  useEffect(() => {
    api.get("/users").then((r) => setUsers(r.data));
    api.get("/permissions").then((r) => setPerms(r.data));
  }, []);

  const ROLE_LABELS = {
    all: "All Roles",
    super_vendor: "Super Vendors",
    regional_vendor: "Regional Vendors",
    driver: "Drivers",
  };

  const displayed = users.filter((u) =>
    filterRole === "all" ? true : u.role === filterRole
  );

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

  const saveUser = async (userId) => {
    const user = users.find((u) => u._id === userId);
    try {
      await api.patch(`/users/${userId}/permissions`, {
        customPermissions: user.customPermissions,
      });
      setNotification({ msg: "Saved!", color: "green" });
    } catch (err) {
      setNotification({
        msg: err.response?.data?.msg || "Save failed",
        color: "red",
      });
    }
    setTimeout(() => setNotification({ msg: "", color: "" }), 3000);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-gray-100 p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-6">All Users & Permissions</h1>

        {notification.msg && (
          <div
            className={`mb-4 p-3 rounded ${
              notification.color === "green"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.msg}
          </div>
        )}

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

        {/* Table container: fixed max height so body scrolls */}
        <div className="bg-white rounded shadow overflow-auto flex-1 max-h-[600px]">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100">
                {/* Add sticky to each header cell */}
                <th className="p-3 text-left sticky top-0 bg-slate-100 z-10">
                  Name
                </th>
                <th className="p-3 text-left sticky top-0 bg-slate-100 z-10">
                  Email
                </th>
                <th className="p-3 text-left sticky top-0 bg-slate-100 z-10">
                  Role
                </th>
                {perms.map((p) => (
                  <th
                    key={p.permissionName}
                    className="p-3 text-center sticky top-0 bg-slate-100 z-10"
                  >
                    {p.permissionName}
                  </th>
                ))}
                <th className="p-3 text-center sticky top-0 bg-slate-100 z-10">
                  Actions
                </th>
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
