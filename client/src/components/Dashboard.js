import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Dashboard</h2>

      <p>
        Welcome, <strong>{user?.email || "User"}</strong>
      </p>

      <div style={{ marginTop: "25px", display: "flex", gap: "12px" }}>
        <button onClick={() => navigate("/profile")}>
          Go to Profile
        </button>

        <button onClick={() => navigate("/inventory")}>
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