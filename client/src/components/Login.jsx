import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        setError("Login failed. Missing token or user data.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      const backendMsg = err?.response?.data?.message || "Invalid email or password";
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "460px", padding: "28px" }}>
        <form onSubmit={submit}>
          <h2 style={{ marginBottom: "8px" }}>Login</h2>
          <p style={{ marginBottom: "18px", opacity: 0.85 }}>
            Sign in to access your dashboard
          </p>

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

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>

          <p style={{ marginTop: "12px" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;