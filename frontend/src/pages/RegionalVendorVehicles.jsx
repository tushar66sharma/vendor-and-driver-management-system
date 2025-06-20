import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const FUELS = ['Petrol','Diesel','Electric','Hybrid'];

export default function RegionalVendorVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm]         = useState({
    registrationNumber: '',
    model: '',
    seatingCapacity: '',
    fuelType: 'Petrol',
    region: '',
  });
  const [files, setFiles]     = useState({ permitFile:null, rcFile:null, pollutionFile:null });
  const [msg, setMsg]         = useState('');
  const root = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/,'');

  // Load vehicles & region on mount
  useEffect(() => {
    (async () => {
      try {
        const me      = await api.get('/auth/me');
        const region  = me.data.region || '';
        setForm(f => ({ ...f, region }));
        const vehRes  = await api.get('/vehicles');
        setVehicles(vehRes.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Add Vehicle (unchanged)
  const handleAdd = async e => {
    e.preventDefault();
    setMsg('');
    try {
      const data = new FormData();
      data.append('registrationNumber', form.registrationNumber);
      data.append('model',              form.model);
      data.append('seatingCapacity',    form.seatingCapacity);
      data.append('fuelType',           form.fuelType.toLowerCase());
      data.append('region',             form.region);
      Object.entries(files).forEach(([k,f]) => data.append(k, f));

      const { data: newVeh } = await api.post('/vehicles', data, {
        headers: { 'Content-Type':'multipart/form-data' }
      });
      setVehicles(vs => [newVeh, ...vs]);
      setForm({ registrationNumber:'', model:'', seatingCapacity:'', fuelType:'Petrol', region: form.region });
      setFiles({ permitFile:null, rcFile:null, pollutionFile:null });
      setMsg('Vehicle added successfully!');
    } catch (err) {
      setMsg(err.response?.data?.msg || err.message);
    }
  };

  // Delete Vehicle: only if not assigned
  const handleDelete = async id => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(vs => vs.filter(v => v._id !== id));
    } catch (err) {
      alert(err.response?.data?.msg || 'Delete failed');
    }
  };

  const fileName = f => f ? f.name || (typeof f === 'string' ? f.split('/').pop() : '') : '';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>
        {msg && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded flex justify-between">
            {msg}<button onClick={()=>setMsg('')}>×</button>
          </div>
        )}

        {/* Add Vehicle Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="registrationNumber" value={form.registrationNumber}
                onChange={e => setForm(f=>({...f, registrationNumber:e.target.value}))}
                placeholder="Registration Number"
                className="border rounded px-3 py-2 w-full" required />

              <input name="model" value={form.model}
                onChange={e=>setForm(f=>({...f, model:e.target.value}))}
                placeholder="Model"
                className="border rounded px-3 py-2 w-full" required />

              <input name="seatingCapacity" value={form.seatingCapacity}
                onChange={e=>setForm(f=>({...f, seatingCapacity:e.target.value}))}
                placeholder="Seating Capacity"
                className="border rounded px-3 py-2 w-full" required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select name="fuelType" value={form.fuelType}
                onChange={e=>setForm(f=>({...f, fuelType:e.target.value}))}
                className="border rounded px-3 py-2 w-full">
                {FUELS.map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['permitFile','rcFile','pollutionFile'].map(key=>(
                <div key={key} className="border rounded-lg p-4 flex flex-col items-center">
                  <div className="mb-2 text-gray-600">
                    {key.replace('File','').toUpperCase()}
                  </div>
                  <div className="mb-2 text-sm text-gray-800 truncate h-5">
                    {fileName(files[key])}
                  </div>
                  <label className="bg-gray-100 border rounded px-3 py-1 text-blue-700 cursor-pointer">
                    Choose File
                    <input type="file" name={key}
                      onChange={e=>setFiles(f=>({...f, [key]:e.target.files[0]}))}
                      className="hidden" required />
                  </label>
                </div>
              ))}
            </div>

            <button type="submit"
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
              Add Vehicle
            </button>
          </form>
        </div>

        {/* Vehicle Fleet Table */}
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Vehicle Fleet</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                {['Reg. No.','Model','Seating','Fuel','RC','Permit','Pollution ','Assigned','Actions'].map(h=>(
                  <th key={h} className="p-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v=>(
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="p-2">{v.registrationNumber}</td>
                  <td className="p-2">{v.model}</td>
                  <td className="p-2">{v.seatingCapacity}</td>
                  <td className="p-2">{v.fuelType}</td>
                  {[v.rcFile,v.permitFile,v.pollutionFile].map((f,i)=>(
                    <td key={i} className="p-2">
                      <a href={`${root}${f}`} target="_blank" rel="noreferrer"
                         className="text-blue-600 hover:underline">
                        View
                      </a>
                    </td>
                  ))}

                  {/* Assigned Badge */}
                  <td className="p-2">
                    {v.assigned ? (
                      <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                        <CheckCircle className="w-4 h-4 mr-1" />Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                        <XCircle className="w-4 h-4 mr-1" />Unassigned
                      </span>
                    )}
                  </td>

                  {/* Delete Button if unassigned */}
                  <td className="p-2">
                    {!v.assigned && (
                      <button
                        onClick={()=>handleDelete(v._id)}
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
          {vehicles.length===0 && (
            <p className="text-center text-gray-500 py-6">
              No vehicles found for your region yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
