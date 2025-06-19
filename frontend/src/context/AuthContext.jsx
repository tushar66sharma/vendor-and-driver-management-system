import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient.js";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [token, setToken]   = useState(() => localStorage.getItem("token"));
  const [role,  setRole]    = useState(() => localStorage.getItem("role"));
  const [user,  setUser]    = useState(null);

  useEffect(() => {
    if (token) {
      api.get("/auth/me")
         .then(res => setUser(res.data))
         .catch(() => logout());
    }
  }, [token]);

  const login = (jwt, role) => {
    localStorage.setItem("token", jwt);
    localStorage.setItem("role",  role);
    setToken(jwt);
    setRole(role);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
