// src/pages/RegionalVendorDashboard.jsx
import Sidebar from '../components/Sidebar';

export default function RegionalVendorDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">
          Regional Vendor Dashboard
        </h1>
        {/* Placeholder content */}
        <p className="text-gray-600">
          Welcome! Use the menu on the left to navigate to your Profile, Drivers, etc.
        </p>
      </main>
    </div>
  );
}
