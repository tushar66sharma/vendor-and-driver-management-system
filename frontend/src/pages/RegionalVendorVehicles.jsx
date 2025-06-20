// src/pages/RegionalVendorVehicles.jsx
import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { CheckCircle, XCircle, Trash2, PlusCircle, Eye } from 'lucide-react';

const FUELS = ['Petrol','Diesel','Electric','Hybrid'];

export default function RegionalVendorVehicles() {
  const [vehicles, setVehicles]         = useState([]);
  const [form, setForm]                 = useState({
    registrationNumber:'', model:'', seatingCapacity:'', fuelType:'Petrol', region:''
  });
  const [files, setFiles]               = useState({ permitFile:null, rcFile:null, pollutionFile:null });
  const [msg, setMsg]                   = useState('');
  const [msgColor, setMsgColor]         = useState('red');
  const [permissions, setPermissions]   = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const root = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get('/auth/me');
        const perms = meRes.data.customPermissions || [];
        setPermissions(perms);
        setForm(f => ({ ...f, region: meRes.data.region || '' }));

        if (perms.includes('View Vehicles')) {
          setLoadingVehicles(true);
          const vehRes = await api.get('/vehicles');
          setVehicles(vehRes.data);
          setLoadingVehicles(false);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleChange = e => setForm(f=>({...f,[e.target.name]: e.target.value}));
  const handleFile   = e => setFiles(f=>({...f,[e.target.name]: e.target.files[0]}));

  const handleAdd = async e => {
    e.preventDefault();
    setMsg('');

    // permission check
    if (!permissions.includes('Add Vehicles')) {
      setMsgColor('red');
      setMsg('You do not have permission to add vehicles.');
      return;
    }

    // file check
    if (!files.rcFile || !files.permitFile || !files.pollutionFile) {
      setMsgColor('red');
      setMsg('Upload 3 files');
      return;
    }

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k,v]) => data.append(k, v));
      Object.entries(files).forEach(([k,f]) => data.append(k,f));

      const { data: newVeh } = await api.post('/vehicles', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVehicles(vs => [newVeh, ...vs]);
      setMsgColor('green');
      setMsg('Vehicle added successfully!');
      setForm({ ...form, registrationNumber:'', model:'', seatingCapacity:'' });
      setFiles({ permitFile:null, rcFile:null, pollutionFile:null });
    } catch (err) {
      setMsgColor('red');
      setMsg(err.response?.data?.msg || err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vs => vs.filter(v => v._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || 'Delete failed');
    }
  };

  const fileName = f => f ? (typeof f === 'string' ? f.split('/').pop() : f.name) : '';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>

        {msg && (
          <div className={`p-3 rounded ${msgColor === 'red' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {msg}
          </div>
        )}

        {/* ADD FORM */}
        {permissions.includes('Add Vehicles') && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <PlusCircle className="mr-2" /> Add New Vehicle
            </h2>
            <form onSubmit={handleAdd} className="space-y-4" noValidate>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  placeholder="Registration Number"
                  className="border rounded p-2"
                  required
                />
                <input
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Model"
                  className="border rounded p-2"
                  required
                />
                <input
                  name="seatingCapacity"
                  value={form.seatingCapacity}
                  onChange={handleChange}
                  type="number"
                  placeholder="Seating Capacity"
                  className="border rounded p-2"
                  required
                />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <select
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  className="border rounded p-2"
                >
                  {FUELS.map(f => <option key={f}>{f}</option>)}
                </select>
                <input
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Region"
                  className="border rounded p-2"
                  readOnly
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {['rcFile','permitFile','pollutionFile'].map(key => (
                  <div key={key} className="border rounded p-4 flex flex-col items-center">
                    <p className="mb-2 font-medium">{key.replace('File','')} Doc</p>
                    <p className="mb-2 text-sm truncate">{fileName(files[key]) || 'No file chosen'}</p>
                    <label className="bg-blue-50 px-3 py-1 rounded cursor-pointer">
                      Browse
                      <input
                        type="file"
                        name={key}
                        onChange={handleFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                ))}
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Submit
              </button>
            </form>
          </div>
        )}

        {/* VEHICLE TABLE */}
        {permissions.includes('View Vehicles') && (
          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Eye className="mr-2" /> Vehicle Fleet
            </h2>

            {loadingVehicles ? (
              <p>Loading vehicles…</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {['Reg No','Model','Seat','Fuel','Assigned','Actions'].map(h => (
                      <th key={h} className="p-2 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(v => (
                    <tr key={v._id} className="hover:bg-gray-50">
                      <td className="p-2">{v.registrationNumber}</td>
                      <td className="p-2">{v.model}</td>
                      <td className="p-2">{v.seatingCapacity}</td>
                      <td className="p-2">{v.fuelType}</td>
                      <td className="p-2">
                        {v.assigned
                          ? <CheckCircle className="inline text-green-600" />
                          : <XCircle className="inline text-red-600" />}
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
            )}
            {!loadingVehicles && vehicles.length === 0 && (
              <p className="text-gray-500 text-center py-6">No vehicles found.</p>
            )}
          </div>
        )}

        {!permissions.includes('Add Vehicles') &&
         !permissions.includes('View Vehicles') && (
          <p className="text-gray-600">
            You don’t have permission to view or add vehicles.
          </p>
        )}
      </main>
    </div>
  );
}
