import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Simple email validator
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const email = data.email.trim();
    const password = data.password;

    // Frontend validation
    if (!isValidEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user (use backend name if returned, else fallback)
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          name: res.data?.name || "User",
        })
      );

      navigate("/dashboard");
    } catch (err) {
      const backendMsg =
        err?.response?.data?.message || "Invalid email or password";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={submit}>
          <h2>CIMS Staff Login</h2>

          {error && <p className="error">{error}</p>}

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={data.email}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Access Inventory"}
          </button>

          <p style={{ marginTop: "10px" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;