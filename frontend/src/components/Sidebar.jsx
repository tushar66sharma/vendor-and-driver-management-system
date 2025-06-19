import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const { role, logout } = useAuth();

  const links = {
    super_vendor: [
      { to: "/super",    label: "Dashboard" },
      { to: "/vendors",  label: "Vendors"   },
    ],
    regional_vendor: [
      { to: "/regional", label: "Dashboard" },
      { to: "/drivers",  label: "Drivers"   },
    ],
    driver: [
      { to: "/driver",   label: "My Trips"  },
    ],
  }[role] || [];

  return (
    <aside className="w-60 h-screen bg-slate-800 text-white flex flex-col">
      <h2 className="p-4 text-xl font-bold border-b border-slate-700">Menu</h2>
      <nav className="flex-1">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `block px-4 py-2 hover:bg-slate-700 ${isActive ? "bg-slate-700" : ""}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="m-4 py-2 rounded bg-red-500 hover:bg-red-600 text-center"
      >
        Log out
      </button>
    </aside>
  );
}
