import axios from "axios";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        setError("Login failed. Missing token or user data.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
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

          <button type="submit">Access Inventory</button>

          <p style={{ marginTop: "10px" }}>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;