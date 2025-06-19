import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function SuperVendorPermissions() {
  const [perms, setPerms]     = useState([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError]     = useState("");

  // 1) Load on mount
  useEffect(() => {
    load();
  }, []);
  const load = () => api.get("/permissions").then(r => setPerms(r.data));

  // 2) Add new
  const handleAdd = async e => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/permissions", {
        permissionName: newName,
        description: newDesc,
      });
      setNewName("");
      setNewDesc("");
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to add");
    }
  };

  // 3) Delete
  const handleDelete = async name => {
    setError("");
    try {
      await api.delete(`/permissions/${name}`);
      load();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">Manage Permissions</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Add form */}
        <form onSubmit={handleAdd} className="mb-6 bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Add New Permission</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Permission Name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </form>

        {/* Permissions table */}
        <div className="bg-white rounded shadow overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">Permission</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {perms.map(p => (
                <tr key={p.permissionName} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.permissionName}</td>
                  <td className="p-3">{p.description}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(p.permissionName)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {perms.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-gray-500">
                    No permissions defined.
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
