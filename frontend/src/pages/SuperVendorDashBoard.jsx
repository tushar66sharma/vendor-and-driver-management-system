import Sidebar from "../components/Sidebar";

export default function SuperVendorDashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Super‑vendor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Vendors"    value="128" />
          <StatCard label="Pending Requests" value="5"   />
          <StatCard label="Earnings (₹)"     value="92 000" />
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded shadow flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-3xl font-semibold">{value}</span>
    </div>
  );
}
