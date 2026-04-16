import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <nav style={navStyle}>
      <h3 style={{ margin: 0 }}>CIMS</h3>

      <div style={rightSectionStyle}>
        {!token && (
          <>
            <Link style={linkStyle} to="/login">Login</Link>
            <Link style={linkStyle} to="/register">Register</Link>
          </>
        )}

        {token && user?.role === "admin" && (
          <>
            <span style={userStyle}>
              👋 {user?.name} (Admin)
            </span>
            <Link style={linkStyle} to="/admin/dashboard">Dashboard</Link>
            <Link style={linkStyle} to="/admin/update-stock">Update Stock</Link>
            <Link style={linkStyle} to="/admin/users">Manage Users</Link>
            <Link style={linkStyle} to="/admin/orders">Orders</Link>
            <Link style={linkStyle} to="/admin/messages">Messages</Link>
            <button style={buttonStyle} onClick={logout}>Logout</button>
          </>
        )}

        {token && user?.role === "user" && (
          <>
            <span style={userStyle}>
              👋 {user?.name} (User)
            </span>
            <Link style={linkStyle} to="/user/dashboard">Dashboard</Link>
            <Link style={linkStyle} to="/user/profile">Profile</Link>
            <Link style={linkStyle} to="/user/inventory">Inventory</Link>
            <Link style={linkStyle} to="/user/messages">Messages</Link>
            <button style={buttonStyle} onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

const navStyle = {
  width: "100%",
  padding: "16px 40px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
  color: "#ffffff",
  position: "sticky",
  top: 0,
  zIndex: 1000,
};

const rightSectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const userStyle = {
  marginRight: "10px",
  fontWeight: "500",
  opacity: 0.9,
};

const linkStyle = {
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
  padding: "6px 10px",
  borderRadius: "8px",
};

const buttonStyle = {
  padding: "8px 14px",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "600",
};

export default Navbar;