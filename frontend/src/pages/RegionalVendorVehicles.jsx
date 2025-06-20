import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { CheckCircle, XCircle } from 'lucide-react';

const REGIONS = ['Southern','Northern','Central','Eastern','Western'];
const FUELS   = ['Petrol','Diesel','Electric','Hybrid'];

export default function RegionalVendorVehicles() {
  const [list, setList] = useState([]);
  const [userRegion, setUserRegion] = useState('');
  const [msg, setMsg] = useState('');

  const [form, setForm] = useState({
    registrationNumber: '',
    model: '',
    seatingCapacity: '',
    fuelType: 'Petrol',
    region: '',
  });

  const [files, setFiles] = useState({ permitFile:null, rcFile:null, pollutionFile:null });
  const root = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  useEffect(() => {
    api.get('/auth/me').then(r => {
      const region = r.data.region || '';
      setUserRegion(region);
      setForm(f => ({ ...f, region }));

      // Fetch region-specific vehicles
      api.get('/vehicles').then(res => {
        setList(res.data.filter(v => v.region === region));
      });
    });
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFile = e => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleAdd = async e => {
    e.preventDefault();
    setMsg('');
    try {
      const data = new FormData();
      data.append('registrationNumber', form.registrationNumber);
      data.append('model', form.model);
      data.append('seatingCapacity', form.seatingCapacity);
      data.append('fuelType', form.fuelType.toLowerCase());
      data.append('region', userRegion); // always use the authenticated user's region
      Object.entries(files).forEach(([k, f]) => data.append(k, f));

      const { data: newVeh } = await api.post('/vehicles', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setList(prev => [newVeh, ...prev]);
      setForm({ registrationNumber:'', model:'', seatingCapacity:'', fuelType:'Petrol', region:userRegion });
      setFiles({ permitFile:null, rcFile:null, pollutionFile:null });
      setMsg('Vehicle added successfully!');
    } catch (err) {
      setMsg(err.response?.data?.msg || err.message);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this vehicle?')) return;
    await api.delete(`/vehicles/${id}`);
    setList(list.filter(v => v._id !== id));
  };

  const fileName = f => f ? f.name || (typeof f === 'string' ? f.split('/').pop() : '') : '';

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold">Manage Vehicles</h1>
        {msg && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded flex items-center justify-between">
            <span><CheckCircle className="inline w-5 h-5 mr-2" />{msg}</span>
            <button onClick={() => setMsg('')}>×</button>
          </div>
        )}

        {/* Add Vehicle Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Registration Number" required />
              <input name="model" value={form.model} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Model" required />
              <input name="seatingCapacity" value={form.seatingCapacity} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Seating Capacity" required />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select name="fuelType" value={form.fuelType} onChange={handleChange} className="border rounded px-3 py-2 w-full">
                {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['permitFile','rcFile','pollutionFile'].map(key => (
                <div key={key} className="border rounded-lg p-4 flex flex-col items-center">
                  <div className="mb-2 text-gray-600">{key.replace('File','').toUpperCase()}</div>
                  <div className="mb-2 text-sm text-gray-800 truncate h-5">{fileName(files[key])}</div>
                  <label className="bg-gray-100 border rounded px-3 py-1 text-blue-700 cursor-pointer hover:bg-blue-50">
                    Choose File
                    <input type="file" name={key} onChange={handleFile} className="hidden" required />
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">Add Vehicle</button>
          </form>
        </div>

        {/* Vehicle Table */}
        <div className="bg-white p-4 rounded-lg shadow w-full overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Vehicle Fleet</h2>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                {['Reg. No.','Model','Seating','Fuel','RC','Permit','Pollution','Status','Assigned'].map(h => (
                  <th key={h} className="p-2 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(v => (
                <tr key={v._id} className="hover:bg-gray-50">
                  <td className="p-2">{v.registrationNumber}</td>
                  <td className="p-2">{v.model}</td>
                  <td className="p-2">{v.seatingCapacity}</td>
                  <td className="p-2">{v.fuelType}</td>
                  {[v.rcFile, v.permitFile, v.pollutionFile].map((f,i) => (
                    <td key={i} className="p-2">
                      <a href={`${root}${f}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                    </td>
                  ))}
                  <td className="p-2">
                    <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Active</span>
                  </td>
                  <td className="p-2">
                    <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:bg-red-50 rounded p-1">
                      <XCircle className="inline w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="text-center text-gray-500 py-6">No vehicles found for your region yet.</p>}
        </div>
      </main>
    </div>
  );
}
