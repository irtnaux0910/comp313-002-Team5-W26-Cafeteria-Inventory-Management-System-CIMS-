import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminCode: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setMessage("");
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        adminCode: data.role === "admin" ? data.adminCode : "",
      };

      const res = await axios.post("http://localhost:5000/api/auth/register", payload);

      setMessage(res.data?.message || "Registration successful");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={submit}>
          <h2>Register</h2>

          {error && <p className="error">{error}</p>}
          {message && <p style={{ color: "green" }}>{message}</p>}

          <input
            type="text"
            name="name"
            placeholder="Name"
            value={data.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={data.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
          />

          <select name="role" value={data.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {data.role === "admin" && (
            <input
              type="text"
              name="adminCode"
              placeholder="Admin Code"
              value={data.adminCode}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p style={{ marginTop: "10px" }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;