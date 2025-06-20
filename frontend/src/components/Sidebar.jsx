import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const { role, logout } = useAuth();

  // Define links per role
  const linksByRole = {
    super_vendor: [
      { to: "/super", label: "Main Dashboard" },
      { to: "/super/users", label: "Users" },
      { to: "/super/roles", label: "Role Change" },
      { to: "/super/permissions", label: "Permissions" },
      { to: "/super/driver-overview",  label: "Driver Overview" },
      { to: "/super/profile", label: "Profile" },
    ],

    regional_vendor: [
      { to: "/regional", label: "Dashboard" },
      { to: "/regional/vehicles", label: "Vehicles" },
      { to: "/regional/licenses", label: "Drivers" },
      { to: "/regional/assign",  label: "Assign Drivers" },
      { to: "/regional/profile", label: "Profile" },
    ],
    driver: [{ to: "/driver", label: "My Profile" }],
  };

  const links = linksByRole[role] || [];

  return (
    <aside className="w-60 bg-slate-800 text-white flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold">Menu</h2>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded hover:bg-slate-700 ${
                isActive ? "bg-slate-700" : ""
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={logout}
        className="mt-auto m-4 py-2 bg-red-500 rounded hover:bg-red-600 text-center"
      >
        Log out
      </button>
    </aside>
  );
}
