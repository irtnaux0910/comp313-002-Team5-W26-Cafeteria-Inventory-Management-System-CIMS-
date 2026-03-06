import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../apiClient";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");

  const getItemStatus = (q) => {
    const n = Number(q);
    if (Number.isNaN(n)) return "NORMAL";
    if (n <= 0) return "EXPIRED";
    if (n <= 5) return "LOW";
    return "NORMAL";
  };

  const getStatusDot = (label) => {
    let color = "green";

    if (label === "LOW") color = "orange";
    if (label === "EXPIRED") color = "red";

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
      const res = await apiClient.get(`/api/inventory?t=${Date.now()}`);

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

    const low = items.filter((i) => getItemStatus(i.qty) === "LOW").length;
    const expired = items.filter((i) => getItemStatus(i.qty) === "EXPIRED").length;

    return { total, low, expired };
  }, [items]);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user?.name || user?.email}</p>

      <button onClick={logout}>Logout</button>
      <button onClick={() => navigate("/update-stock")} style={{ marginLeft: 10 }}>
        Update Stock
      </button>

      <hr />

      <h3>Inventory Overview</h3>
      <p>Total Items: {counts.total}</p>
      <p>Low Stock Items: {counts.low}</p>
      <p>Expired Items: {counts.expired}</p>

      <hr />

      <h3>Inventory List</h3>

      <p style={{ margin: "10px 0" }}>
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

      {status && <p>{status}</p>}

      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <table
          width="100%"
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", maxWidth: 900 }}
        >
          <thead>
            <tr>
              <th align="left">Item</th>
              <th align="left">Category</th>
              <th align="left">Qty</th>
              <th align="left">Status</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const label = getItemStatus(item.qty);

              return (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category || "-"}</td>
                  <td>{item.qty ?? 0}</td>
                  <td>{getStatusDot(label)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dashboard;