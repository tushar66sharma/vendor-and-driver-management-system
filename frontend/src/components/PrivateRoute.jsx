import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute({ allowed }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (allowed && !allowed.includes(role)) return <Navigate to="/" />;
  return <Outlet />;
}
