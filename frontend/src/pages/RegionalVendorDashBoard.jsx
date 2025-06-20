import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { Users, Truck, User, Database } from 'lucide-react';

export default function RegionalVendorDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/region/dashboard')
      .then(res => setStats(res.data))
      .catch(err => setError(err.response?.data?.msg || 'Failed to load stats'));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 text-red-600">{error}</main>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">Loading…</main>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Drivers',
      value: stats.totalDrivers,
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      label: 'Total Vehicles',
      value: stats.totalVehicles,
      icon: <Truck className="w-8 h-8 text-green-500" />,
    },
    {
      label: 'Drivers Assigned',
      value: stats.driversAssigned,
      icon: <User className="w-8 h-8 text-purple-500" />,
    },
    {
      label: 'Vehicles Assigned',
      value: stats.vehiclesAssigned,
      icon: <Database className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Regional Vendor Dashboard</h1>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4"
            >
              <div className="p-3 bg-gray-100 rounded-full">{c.icon}</div>
              <div>
                <p className="text-sm text-gray-500 uppercase">{c.label}</p>
                <p className="text-3xl font-semibold">{c.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions List */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Your Permissions</h2>
          {stats.permissions.length === 0 ? (
            <p className="text-gray-600">You have no custom permissions.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {stats.permissions.map((perm) => (
                <li
                  key={perm}
                  className="bg-green-50 text-green-800 px-4 py-2 rounded-lg text-sm"
                >
                  {perm}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
