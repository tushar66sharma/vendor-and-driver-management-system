// src/pages/SuperVendorDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar.jsx";
import { Users2, Truck } from "lucide-react";

export default function SuperVendorDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/stats/super")
      .then(res => setStats(res.data))
      .catch(() => setError("Failed to load dashboard."));
  }, []);

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-medium">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-10 text-center text-gray-600 animate-pulse">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-10">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800">
          Super Vendor Dashboard
        </h1>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <MetricCard
            icon={<Users2 className="w-10 h-10 text-indigo-500" />}
            title="Total Users"
            value={stats.total_users}
            bg="from-indigo-50 to-white"
          />

          <MetricCard
            icon={<Truck className="w-10 h-10 text-green-500" />}
            title="Total Drivers"
            value={stats.total_drivers}
            bg="from-green-50 to-white"
          />
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, title, value, bg }) {
  return (
    <div
      className={`
        bg-gradient-to-br ${bg}
        p-6 rounded-2xl shadow-xl
        flex items-center space-x-6
        transform transition hover:scale-[1.02]
      `}
    >
      <div className="p-4 bg-white rounded-full shadow">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-1 text-4xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
