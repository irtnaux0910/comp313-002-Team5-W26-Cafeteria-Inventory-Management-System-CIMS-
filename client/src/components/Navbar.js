import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      <h3>Software Project 2</h3>

      <div>
        {!token && (
          <>
            <Link style={linkStyle} to="/login">Login</Link>
            <Link style={linkStyle} to="/register">Register</Link>
          </>
        )}

        {token && (
          <>
            <span style={{ marginRight: "15px" }}>
              👋 {user?.email}
            </span>
            <Link style={linkStyle} to="/dashboard">Dashboard</Link>
            <button style={buttonStyle} onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  width: "100%",
  padding: "15px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#1e293b",
  color: "white"
};

const linkStyle = {
  marginRight: "15px",
  color: "white",
  textDecoration: "none"
};

const buttonStyle = {
  padding: "6px 10px",
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default Navbar;