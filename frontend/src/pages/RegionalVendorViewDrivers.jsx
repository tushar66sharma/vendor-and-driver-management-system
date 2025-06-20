import { useEffect, useState } from 'react';
import api from '../api/axiosClient';
import Sidebar from '../components/Sidebar';

export default function RegionalVendorViewDrivers() {
  const [docs, setDocs] = useState([]);

  // Base URL without /api
  const root = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
                  .replace(/\/api$/, '');

  useEffect(() => {
    api.get('/driver-docs/region')
       .then(res => setDocs(res.data))
       .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">
          My Region’s Drivers & Licenses
        </h1>
        
        {docs.length === 0 ? (
          <p className="text-gray-600">
            No drivers found in your region.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {['Name','Email','Uploaded At','Driving License'].map(h => (
                    <th key={h} className="p-3 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.userId} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {d.firstName} {d.lastName}
                    </td>
                    <td className="p-3">{d.email}</td>
                    <td className="p-3">
                      {d.uploadedAt
                        ? new Date(d.uploadedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">
                      {d.filePath ? (
                        <a
                          href={`${root}${d.filePath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View License
                        </a>
                      ) : (
                        <span className="text-red-600">Not uploaded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
