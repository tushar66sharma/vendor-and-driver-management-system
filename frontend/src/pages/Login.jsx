import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);

  const { login } = useAuth();
  const nav       = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log("✅ Login success:", data);

      // store token + role
      login(data.token, data.role);

      // send user to the correct dashboard
      if (data.role === "super_vendor")      nav("/super",    { replace: true });
      else if (data.role === "regional_vendor") nav("/regional", { replace: true });
      else                                    nav("/driver",   { replace: true });
    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.msg || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-80 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Sign in</h1>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-sm text-center">
          No account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
