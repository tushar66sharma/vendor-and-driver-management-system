import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SuperDash from "./pages/SuperVendorDashBoard.jsx";
import RegDash from "./pages/RegionalVendorDashBoard.jsx";
import DriverDash from "./pages/DriverDashBoard.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import SuperVendorAllUsers from "./pages/SuperVendorAllUsers.jsx";
import SuperVendorAllRoles from "./pages/SuperVendorAllRoles.jsx";
import SuperVendorPermissions from "./pages/SuperVendorPermissions.jsx";
import SuperVendorProfile from "./pages/SuperVendorProfile.jsx";
import DriverDashboard from "./pages/DriverDashBoard.jsx";
import RegionalVendorProfile from "./pages/RegionalVendorProfile.jsx";
import RegionalVendorDashboard from "./pages/RegionalVendorDashBoard.jsx";
import RegionalVendorVehicles from "./pages/RegionalVendorVehicles.jsx";

/* helper component: send user to the right dashboard */
function RedirectByRole() {
  const { role } = useAuth();

  if (role === "super_vendor") return <Navigate to="/super" replace />;
  if (role === "regional_vendor") return <Navigate to="/regional" replace />;
  if (role === "driver") return <Navigate to="/driver" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* protected root → redirect by role */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<RedirectByRole />} />
          </Route>

          {/* role‑specific dashboards */}
          <Route element={<PrivateRoute allowed={["super_vendor"]} />}>
            <Route path="/super/*" element={<SuperDash />} />
            <Route path="/super/users" element={<SuperVendorAllUsers />} />
            <Route path="/super/roles" element={<SuperVendorAllRoles />} />
            <Route
              path="/super/permissions"
              element={<SuperVendorPermissions />}
            />
            <Route path="/super/profile" element={<SuperVendorProfile />} />
          </Route>

          <Route element={<PrivateRoute allowed={["regional_vendor"]} />}>
            <Route path="/regional/*" element={<RegDash />} />
          </Route>

          <Route element={<PrivateRoute allowed={["driver"]} />}>
            <Route path="/driver/*" element={<DriverDash />} />
          </Route>
          <Route element={<PrivateRoute allowed={["driver"]} />}>
            <Route path="/driver" element={<DriverDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowed={["regional_vendor"]} />}>
            <Route path="/regional" element={<RegionalVendorDashboard />} />
            <Route
              path="/regional/profile"
              element={<RegionalVendorProfile />}
            />
            <Route path="/regional/vehicles"  element={<RegionalVendorVehicles />} />
            {/* other /regional routes */}
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
