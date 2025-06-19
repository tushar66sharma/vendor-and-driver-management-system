// src/pages/SuperVendorDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar.jsx";

export default function SuperVendorDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/stats/super").then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-10">
        <h1 className="text-3xl font-semibold mb-6">Main Dashboard</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
          <Card title="Users" value={stats.total_users} />
          <Card title="Roles" value={stats.total_roles} />
          <Card title="Permissions" value={stats.total_permissions} />
        </div>
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
      <h2 className="text-xl font-medium mb-2">{title}</h2>
      <p className="text-4xl font-bold text-blue-600">{value}</p>
    </div>
  );
}
