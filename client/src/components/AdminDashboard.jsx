import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const getItemStatus = (quantity, reorderLevel) => {
    const qty = Number(quantity);
    const reorder = Number(reorderLevel ?? 5);

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
          width: "12px",
          height: "12px",
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
      const res = await api.get("/items");
      setItems(res.data.items || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized();
      } else {
        setStatus("Failed to load inventory");
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const counts = useMemo(() => {
    const total = items.length;
    const low = items.filter((i) => getItemStatus(i.quantity, i.reorderLevel) === "LOW").length;
    const expired = items.filter((i) => getItemStatus(i.quantity, i.reorderLevel) === "EXPIRED").length;

    return { total, low, expired };
  }, [items]);

  const filteredAndSortedItems = useMemo(() => {
    let updatedItems = [...items];

    if (search.trim()) {
      updatedItems = updatedItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "name") {
      updatedItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "quantity") {
      updatedItems.sort((a, b) => a.quantity - b.quantity);
    } else if (sortBy === "lowStock") {
      updatedItems.sort((a, b) => {
        const aLow = a.quantity <= a.reorderLevel ? 0 : 1;
        const bLow = b.quantity <= b.reorderLevel ? 0 : 1;
        if (aLow !== bLow) return aLow - bLow;
        return a.quantity - b.quantity;
      });
    }

    return updatedItems;
  }, [items, search, sortBy]);

  return (
    <div className="page-shell">
      <h2 className="page-title">Manager Dashboard</h2>

      <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
        <p>Welcome, {user?.name || user?.email}</p>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button className="danger-btn" onClick={logout}>
            Logout
          </button>
          <button className="primary-btn" onClick={() => navigate("/admin/update-stock")}>
            Update Stock
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ marginBottom: "16px" }}>Inventory Overview</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
            gap: "14px",
          }}
        >
          <div className="glass-panel" style={{ padding: "16px" }}>
            <strong>Total Items</strong>
            <p style={{ fontSize: "28px", marginTop: "10px" }}>{counts.total}</p>
          </div>

          <div className="glass-panel" style={{ padding: "16px" }}>
            <strong>Low Stock Items</strong>
            <p style={{ fontSize: "28px", marginTop: "10px", color: "#fbbf24" }}>{counts.low}</p>
          </div>

          <div className="glass-panel" style={{ padding: "16px" }}>
            <strong>Expired Items</strong>
            <p style={{ fontSize: "28px", marginTop: "10px", color: "#f87171" }}>{counts.expired}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "20px" }}>
        <h3 style={{ marginBottom: "12px" }}>Inventory List</h3>

        <p style={{ marginBottom: "16px" }}>
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div></div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by item name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "8px 12px",
                minWidth: "220px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "8px 12px",
                minWidth: "180px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
              }}
            >
              <option value="default">Default</option>
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="lowStock">Low Stock First</option>
            </select>
          </div>
        </div>

        {status && <p>{status}</p>}

        {filteredAndSortedItems.length === 0 ? (
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
                {filteredAndSortedItems.map((item) => {
                  const label = getItemStatus(item.quantity, item.reorderLevel);
                  const isLow = label === "LOW";
                  const isExpired = label === "EXPIRED";

                  return (
                    <tr
                      key={item._id}
                      style={
                        isExpired
                          ? { backgroundColor: "rgba(239, 68, 68, 0.12)" }
                          : isLow
                          ? { backgroundColor: "rgba(245, 158, 11, 0.12)" }
                          : undefined
                      }
                    >
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

export default AdminDashboard;