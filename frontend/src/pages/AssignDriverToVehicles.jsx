import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';

export default function AssignDriverToVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers]   = useState([]);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    // 1) Load vehicles
    api.get('/vehicles').then(r => setVehicles(r.data));
    // 2) Load drivers in region
    api.get('/users/drivers/region').then(r => setDrivers(r.data));
  }, []);

  const assignDriver = async (vehicleId, driverId) => {
    if (!driverId) return;
    try {
      const { data: updatedVeh } = await api.patch(
        `/vehicles/${vehicleId}/assign-driver`,
        { driverId }
      );
      setVehicles(vs => vs.map(v => v._id === vehicleId ? updatedVeh : v));
      setMsg('Driver assigned successfully!');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Assignment failed');
    }
  };

  const unassignDriver = async vehicleId => {
    if (!window.confirm('Unassign the current driver?')) return;
    try {
      const { data: updatedVeh } = await api.patch(
        `/vehicles/${vehicleId}/unassign-driver`
      );
      setVehicles(vs => vs.map(v => v._id === vehicleId ? updatedVeh : v));
      setMsg('Driver unassigned successfully!');
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Unassignment failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Assign/Unassign Drivers</h1>

        {msg && (
          <div className="bg-green-100 text-green-700 p-4 rounded">
            {msg}
          </div>
        )}

        <table className="min-w-full bg-white rounded shadow overflow-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Vehicle</th>
              <th className="p-2 text-left">Driver</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v._id} className="border-b hover:bg-gray-50">
                <td className="p-2">
                  {v.registrationNumber} — {v.model}
                </td>
                <td className="p-2">
                  {v.driverId
                    ? drivers.find(d => d._id === v.driverId)?.firstName + 
                      ' ' + drivers.find(d => d._id === v.driverId)?.lastName
                    : '—'}
                </td>
                <td className="p-2 space-x-2">
                  {!v.assigned ? (
                    <select
                      defaultValue=""
                      onChange={e => assignDriver(v._id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="">Assign Driver</option>
                      {drivers.map(d => (
                        <option key={d._id} value={d._id}>
                          {d.firstName} {d.lastName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => unassignDriver(v._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Unassign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
