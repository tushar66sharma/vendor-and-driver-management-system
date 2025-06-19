import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient.js";

export default function Register() {
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "", password: "", role: "driver"
    });
    const [error, setError] = useState(null);
    const nav = useNavigate();

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async e => {
        e.preventDefault();
        try {
            await api.post("/auth/register", form);
            nav("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form
                onSubmit={submit}
                className="bg-white p-8 rounded shadow w-80 space-y-4"
            >
                <h1 className="text-xl font-semibold text-center">Create account</h1>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    className="w-full px-3 py-2 border rounded"
                    required
                />

                <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full px-3 py-2 border rounded"
                    required
                />

                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="w-full px-3 py-2 border rounded"
                    required
                />

                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full px-3 py-2 border rounded"
                    required
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                >
                    <option value="super_vendor">Super‑vendor</option>
                    <option value="regional_vendor">Regional‑vendor</option>
                    <option value="driver">Driver</option>
                </select>

                <button
                    type="submit"
                    className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                    Register
                </button>

                <p className="text-sm text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
