// frontend/src/pages/DriverDashboard.jsx
import { useState, useEffect } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";
import {
  UserCircle2,
  MapPin,
  ChevronDown,
  UploadCloud,
  Eye,
  Truck,
} from "lucide-react";

const REGIONS = [
  { value: "northern", label: "Northern" },
  { value: "southern", label: "Southern" },
  { value: "central",  label: "Central"  },
  { value: "eastern",  label: "Eastern"  },
  { value: "western",  label: "Western"  },
];

export default function DriverDashboard() {
  const [user,     setUser]     = useState(null);
  const [region,   setRegion]   = useState("");
  const [msg,      setMsg]      = useState("");
  const [doc,      setDoc]      = useState(null);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [assigned, setAssigned] = useState([]);

  // Derive API base for static files
  const raw      = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const API_BASE = raw.replace(/\/api$/, "");

  useEffect(() => {
    // Load profile
    api.get("/auth/me")
      .then(r => {
        setUser(r.data);
        setRegion(r.data.region || "");
      })
      .catch(() => {});

    // Load existing license
    api.get("/driver-docs")
      .then(r => setDoc(r.data))
      .catch(() => setDoc(null));

    // Load assigned vehicles for this driver
    api.get("/vehicles/my-assigned")
      .then(r => setAssigned(r.data))
      .catch(() => setAssigned([]));
  }, []);

  // Save region update
  const saveRegion = async () => {
    setMsg("");
    try {
      const { data } = await api.patch("/auth/me", { region });
      setUser(data);
      setMsg("Region saved!");
    } catch {
      setMsg("Failed to save region");
    }
  };

  // File input change
  const onFileChange = e => setFile(e.target.files[0]);

  // Upload new license
  const uploadLicense = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("license", file);
    try {
      const { data } = await api.post("/driver-docs", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDoc(data);
      setFile(null);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Driver Dashboard</h1>

        {/* Profile & Region */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="flex items-center bg-gradient-to-r from-green-600 to-teal-600 p-6">
            <UserCircle2 className="w-16 h-16 text-white mr-4" />
            <div>
              <h2 className="text-2xl font-semibold text-white">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-green-100">{user.email}</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center text-gray-700 space-x-2">
              <MapPin className="w-5 h-5 text-green-500" />
              <span>
                <strong>Current Region:</strong>{" "}
                {user.region
                  ? REGIONS.find(r => r.value === user.region)?.label
                  : "Not set"}
              </span>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Region
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select a region...</option>
                {REGIONS.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <button
              onClick={saveRegion}
              className="w-full py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
            >
              Save Region
            </button>

            {msg && (
              <p className="text-sm text-green-600 text-center">{msg}</p>
            )}
          </div>
        </div>

        {/* License Upload */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Driving License
          </h2>

          {doc ? (
            <button
              onClick={() => window.open(`${API_BASE}${doc.filePath}`, "_blank")}
              className="flex items-center text-teal-600 hover:underline space-x-2"
            >
              <Eye className="w-5 h-5" />
              <span>View Current License</span>
            </button>
          ) : (
            <p className="text-gray-500">No license uploaded.</p>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <UploadCloud className="w-6 h-6 text-gray-500" />
              <span className="text-gray-700">Choose File</span>
              <input type="file" onChange={onFileChange} className="hidden" />
            </label>
            <button
              onClick={uploadLicense}
              disabled={!file || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Uploading..." : "Upload License"}
            </button>
          </div>
          {file && (
            <p className="text-sm text-gray-600">
              Selected: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        {/* Assigned Vehicles */}
        <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Truck className="w-6 h-6 text-gray-600" />
            <span>My Assigned Vehicles</span>
          </h2>

          {assigned.length === 0 ? (
            <p className="text-gray-600">No vehicles assigned yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "Reg. Number",
                      "Model",
                      "Seating",
                      "Fuel",
                      "Assigned On",
                    ].map(h => (
                      <th key={h} className="p-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assigned.map(v => (
                    <tr key={v._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{v.registrationNumber}</td>
                      <td className="p-3">{v.model}</td>
                      <td className="p-3">{v.seatingCapacity}</td>
                      <td className="p-3">{v.fuelType}</td>
                      <td className="p-3">
                        {new Date(v.updatedAt || v.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
