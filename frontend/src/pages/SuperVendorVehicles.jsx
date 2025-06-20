// src/pages/SuperVendorVehicles.jsx
import { useState, useEffect } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

const FUELS = ["Petrol", "Diesel", "Electric", "Hybrid"];
const REGIONS = [
  "all",
  "northern",
  "southern",
  "central",
  "eastern",
  "western",
];

export default function SuperVendorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [form, setForm] = useState({
    registrationNumber: "",
    model: "",
    seatingCapacity: "",
    fuelType: "Petrol",
    region: "",
  });
  const [files, setFiles] = useState({
    permitFile: null,
    rcFile: null,
    pollutionFile: null,
  });
  const [msg, setMsg] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const root = (
    process.env.REACT_APP_API_URL || "http://localhost:5000/api"
  ).replace(/\/api$/, "");

  useEffect(() => {
    api
      .get("/vehicles/all")
      .then((res) => {
        setVehicles(res.data);
        setFiltered(res.data);
      })
      .catch(console.error);
  }, []);

  // Apply filters
  useEffect(() => {
    let list = [...vehicles];
    if (filterRegion !== "all") {
      list = list.filter((v) => v.region.toLowerCase() === filterRegion);
    }
    if (filterStatus !== "all") {
      const assigned = filterStatus === "assigned";
      list = list.filter((v) => v.assigned === assigned);
    }
    setFiltered(list);
  }, [filterRegion, filterStatus, vehicles]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleFile = (e) =>
    setFiles((f) => ({ ...f, [e.target.name]: e.target.files[0] }));

  const handleAdd = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      Object.entries(files).forEach(([k, f]) => data.append(k, f));
      const { data: newVeh } = await api.post("/vehicles", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setVehicles((vs) => [newVeh, ...vs]);
      setMsg("Vehicle added successfully!");
      setForm({
        registrationNumber: "",
        model: "",
        seatingCapacity: "",
        fuelType: "Petrol",
        region: "",
      });
      setFiles({ permitFile: null, rcFile: null, pollutionFile: null });
    } catch (err) {
      setMsg(err.response?.data?.msg || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles((vs) => vs.filter((v) => v._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || "Delete failed");
    }
  };

  const fileName = (f) =>
    f ? (typeof f === "string" ? f.split("/").pop() : f.name) : "";

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Manage Vehicles (Super Vendor)</h1>
        {msg && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded flex justify-between">
            {msg}
            <button onClick={() => setMsg("")} className="ml-4">
              ×
            </button>
          </div>
        )}

        {/* Add Vehicle Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                placeholder="Registration Number"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="Model"
                className="border rounded px-3 py-2 w-full"
                required
              />
              <input
                name="seatingCapacity"
                value={form.seatingCapacity}
                onChange={handleChange}
                placeholder="Seating Capacity"
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                name="fuelType"
                value={form.fuelType}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                {FUELS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
              >
                <option value="">Select Region</option>
                {REGIONS.filter((r) => r !== "all").map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["rcFile", "permitFile", "pollutionFile"].map((key) => (
                <div
                  key={key}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center hover:border-gray-500 transition"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {key.replace("File", "")} Doc
                  </p>
                  <p className="text-sm text-gray-500 truncate w-36 mb-2">
                    {fileName(files[key]) || "No file chosen"}
                  </p>
                  <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded cursor-pointer">
                    Browse
                    <input
                      type="file"
                      name={key}
                      onChange={handleFile}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Add Vehicle
            </button>
          </form>
        </div>
        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="border rounded px-3 py-2"
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r === "all"
                  ? "All Regions"
                  : r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        {/* Vehicle Fleet Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Vehicle Fleet</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                {[
                  "Reg. No.",
                  "Model",
                  "Seating",
                  "Fuel",
                  "Region",
                  "Assigned",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="p-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="p-2">{v.registrationNumber}</td>
                  <td className="p-2">{v.model}</td>
                  <td className="p-2">{v.seatingCapacity}</td>
                  <td className="p-2">{v.fuelType}</td>
                  <td className="p-2">{v.region}</td>
                  <td className="p-2">
                    {v.assigned ? (
                      <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        <XCircle className="w-4 h-4 mr-1" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {!v.assigned && (
                      <button
                        onClick={() => handleDelete(v._id)}
                        className="text-red-600 hover:bg-red-50 rounded p-1"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <p className="text-center text-gray-500 py-6">
              No vehicles match the filters.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
