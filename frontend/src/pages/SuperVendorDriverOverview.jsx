// src/pages/SuperVendorDriverOverview.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

// Regions filter options, include 'all' for no filter
const REGIONS = ["all", "Northern", "Southern", "Central", "Eastern", "Western"];

export default function SuperVendorDriverOverview() {
  const [drivers, setDrivers] = useState([]);
  const [filterRegion, setFilterRegion] = useState("all");

  // Derive base URL for file links
  const rawApi = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const API_BASE = rawApi.replace(/\/api$/, "");

  // Fetch overview data
  useEffect(() => {
    api.get("/admin/driver-overview")
       .then(res => setDrivers(res.data))
       .catch(console.error);
  }, []);

  // Compute which drivers to display based on selected region filter
  const displayedDrivers = drivers.filter(d => {
    if (filterRegion === "all") return true;
    return d.region && d.region.toLowerCase() === filterRegion;
  });

  // Assign a vehicle to a driver
  const handleAssign = async (vehicleId, userId) => {
    await api.post(`/admin/vehicles/${vehicleId}/assign`, { driverId: userId });
    setDrivers(ds => ds.map(d => {
      if (d.userId === userId) {
        const veh = d.availableVehicles.find(v => v._id === vehicleId);
        return {
          ...d,
          vehicles: [...d.vehicles, veh],
          availableVehicles: d.availableVehicles.filter(v => v._id !== vehicleId),
        };
      }
      return d;
    }));
  };

  // Unassign a vehicle from a driver
  const handleUnassign = async (vehicleId, userId) => {
    if (!window.confirm("Unassign this vehicle?")) return;
    await api.patch(`/admin/vehicles/${vehicleId}/unassign`);
    setDrivers(ds => ds.map(d => {
      if (d.userId === userId) {
        const veh = d.vehicles.find(v => v._id === vehicleId);
        return {
          ...d,
          vehicles: d.vehicles.filter(v => v._id !== vehicleId),
          availableVehicles: [...d.availableVehicles, veh],
        };
      }
      return d;
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 overflow-auto space-y-6">
        <h1 className="text-3xl font-bold">Drivers & Vehicle Assignment</h1>

        {/* Region filter dropdown */}
        <div className="flex items-center gap-4">
          <label htmlFor="regionFilter" className="font-medium">Filter by Region:</label>
          <select
            id="regionFilter"
            value={filterRegion}
            onChange={e => setFilterRegion(e.target.value)}
            className="border rounded p-2"
          >
            {REGIONS.map(r => (
              <option key={r} value={r.toLowerCase()}>
                {r === "all" ? "All Regions" : r}
              </option>
            ))}
          </select>
        </div>

        {displayedDrivers.length === 0 && (
          <p className="text-gray-600">No drivers found.</p>
        )}

        {displayedDrivers.map(d => (
          <div key={d.userId} className="bg-white rounded-lg shadow p-6 space-y-4">
            {/* Header with name, email, region, license */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {d.firstName} {d.lastName}
                </h2>
                <p className="text-gray-600">{d.email}</p>
                <p className="text-sm text-gray-500">
                  Region: <span className="font-medium">{d.region}</span>
                </p>
              </div>
              {d.license ? (
                <a
                  href={`${API_BASE}${d.license}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View License
                </a>
              ) : (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded">
                  No License
                </span>
              )}
            </div>

            {/* Assigned Vehicles */}
            <div>
              <h3 className="font-medium mb-2">Assigned Vehicles</h3>
              {d.vehicles.length === 0 ? (
                <p className="text-gray-500">None assigned.</p>
              ) : (
                <ul className="space-y-2">
                  {d.vehicles.map(v => (
                    <li key={v._id} className="flex justify-between items-center border p-3 rounded">
                      <span>
                        <strong>{v.registrationNumber}</strong> — {v.model}
                      </span>
                      <button
                        onClick={() => handleUnassign(v._id, d.userId)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Available Vehicles (requires license) */}
            <div>
              <h3 className="font-medium mb-2">Available Vehicles</h3>
              {!d.license ? (
                <p className="text-red-600">Cannot assign until driver uploads a license.</p>
              ) : d.availableVehicles.length === 0 ? (
                <p className="text-gray-500">No available vehicles in this region.</p>
              ) : (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleAssign(e.target.vehicle.value, d.userId);
                  }}
                  className="flex items-center space-x-4"
                >
                  <select name="vehicle" className="border rounded p-2 flex-1" required>
                    <option value="">Select vehicle…</option>
                    {d.availableVehicles.map(v => (
                      <option key={v._id} value={v._id}>
                        {v.registrationNumber} — {v.model}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    Assign
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
