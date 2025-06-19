// src/pages/SuperVendorProfile.jsx
import { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';
import { UserCircle2, MapPin, Calendar, Globe } from 'lucide-react';

const REGIONS = [
  { value: 'northern', label: 'Northern' },
  { value: 'southern', label: 'Southern' },
  { value: 'central',  label: 'Central'  },
  { value: 'eastern',  label: 'Eastern'  },
  { value: 'western',  label: 'Western'  },
];

export default function SuperVendorProfile() {
  const [user, setUser]     = useState(null);
  const [region, setRegion] = useState('');
  const [msg, setMsg]       = useState('');

  useEffect(() => {
    api.get('/auth/me').then(res => {
      setUser(res.data);
      setRegion(res.data.region || '');
    });
  }, []);

  const handleSave = async () => {
    setMsg('');
    try {
      const { data } = await api.patch('/auth/me', { region });
      setUser(data);
      setMsg('Profile updated!');
    } catch {
      setMsg('Update failed, try again');
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800">My Profile</h1>

        <div className="max-w-3xl mx-auto grid gap-8">
          {/* PROFILE HEADER CARD */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center space-x-6">
            <div className="p-2 bg-indigo-100 rounded-full">
              <UserCircle2 className="w-20 h-20 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* DETAILS FORM */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {msg && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                {msg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region */}
              <div>
                <label className="flex items-center text-gray-700 mb-2">
                  <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="font-medium">Region</span>
                </label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select region...</option>
                  {REGIONS.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Join Date (readonly example) */}
              <div>
                <label className="flex items-center text-gray-700 mb-2">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                  <span className="font-medium">Joined On</span>
                </label>
                <input
                  type="text"
                  readOnly
                  value={new Date(user.createdAt).toLocaleDateString()}
                  className="w-full border-gray-300 rounded-lg shadow-sm px-4 py-2 bg-gray-50"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-8 w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
