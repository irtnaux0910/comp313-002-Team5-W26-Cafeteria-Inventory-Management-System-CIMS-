import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/axiosClient";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const getItemStatus = (quantity, reorderLevel) => {
    const qty = Number(quantity);
    const reorder = Number(reorderLevel ?? 5);

    if (Number.isNaN(qty)) return "NORMAL";
    if (qty <= 0) return "EXPIRED";
    if (qty <= reorder) return "LOW";
    return "NORMAL";
  };

  const getStatusDot = (label) => {
    let color = "#22c55e";

    if (label === "LOW") color = "#f59e0b";
    if (label === "EXPIRED") color = "#ef4444";

    return (
      <span
        title={label}
        style={{
          display: "inline-block",
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      ></span>
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const fetchInventory = async () => {
    try {
      setStatus("");
      const res = await apiClient.get("/items");
      const list = Array.isArray(res.data) ? res.data : res.data.items || [];
      setItems(list);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized();
      } else {
        setStatus("Failed to load inventory");
        console.log(err);
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const counts = useMemo(() => {
    const total = items.length;

    const low = items.filter(
      (i) => getItemStatus(i.quantity, i.reorderLevel) === "LOW"
    ).length;

    const expired = items.filter(
      (i) => getItemStatus(i.quantity, i.reorderLevel) === "EXPIRED"
    ).length;

    return { total, low, expired };
  }, [items]);

  return (
    <div className="page-shell">
      <h2 className="page-title">Manager Dashboard</h2>

      <div className="glass-panel" style={{ padding: "24px", marginBottom: "24px" }}>
        <p style={{ marginBottom: "16px" }}>
          Welcome, <strong>{user?.name || user?.email || "Admin"}</strong>
        </p>

        <div className="action-group">
          <button className="danger-btn" onClick={logout}>
            Logout
          </button>

          <button
            className="primary-btn"
            onClick={() => navigate("/admin/update-stock")}
          >
            Update Stock
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "16px" }}>Inventory Overview</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="card" style={{ padding: "18px" }}>
            <h4 style={{ marginBottom: "8px" }}>Total Items</h4>
            <p style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>{counts.total}</p>
          </div>

          <div className="card" style={{ padding: "18px" }}>
            <h4 style={{ marginBottom: "8px" }}>Low Stock Items</h4>
            <p style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, color: "#fbbf24" }}>
              {counts.low}
            </p>
          </div>

          <div className="card" style={{ padding: "18px" }}>
            <h4 style={{ marginBottom: "8px" }}>Expired Items</h4>
            <p style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0, color: "#f87171" }}>
              {counts.expired}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ marginBottom: "12px" }}>Inventory List</h3>

        <p style={{ marginBottom: "18px" }}>
          Status Indication:
          <span style={{ marginLeft: "10px", verticalAlign: "middle" }}>
            {getStatusDot("NORMAL")}
          </span>
          <span style={{ marginLeft: "6px", marginRight: "12px" }}>Normal</span>

          <span style={{ verticalAlign: "middle" }}>
            {getStatusDot("LOW")}
          </span>
          <span style={{ marginLeft: "6px", marginRight: "12px" }}>Low</span>

          <span style={{ verticalAlign: "middle" }}>
            {getStatusDot("EXPIRED")}
          </span>
          <span style={{ marginLeft: "6px" }}>Expired</span>
        </p>

        {status && <p className="error">{status}</p>}

        {items.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th align="left">Item</th>
                  <th align="left">Category</th>
                  <th align="left">Qty</th>
                  <th align="left">Reorder</th>
                  <th align="left">Status</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => {
                  const label = getItemStatus(item.quantity, item.reorderLevel);
                  const isLow = label === "LOW";

                  return (
                    <tr key={item._id} className={isLow ? "low-stock-row" : ""}>
                      <td>{item.name}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.quantity ?? 0}</td>
                      <td>{item.reorderLevel ?? 5}</td>
                      <td>{getStatusDot(label)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;