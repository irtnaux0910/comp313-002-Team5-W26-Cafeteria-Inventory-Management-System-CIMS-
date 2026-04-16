import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Dashboard</h2>

      <p>
        Welcome, <strong>{user?.name || user?.email || "User"}</strong>
      </p>

      <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
        <button onClick={() => navigate("/user/profile")}>
          Go to Profile
        </button>

        <button onClick={() => navigate("/user/inventory")}>
          Go to Inventory
        </button>

        <button
          onClick={logout}
          style={{ backgroundColor: "#ef4444", color: "white" }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;