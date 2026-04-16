import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";

function UpdateStock() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newQty, setNewQty] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadItems = async () => {
    try {
      setErr("");
      const res = await api.get("/items");
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load inventory");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const selectedItem = useMemo(() => {
    return items.find((item) => item._id === selectedId) || null;
  }, [items, selectedId]);

  const getItemStatus = (quantity, reorderLevel) => {
    const qty = Number(quantity);
    const reorder = Number(reorderLevel ?? 5);

    if (qty <= 0) return "Expired";
    if (qty <= reorder) return "Low";
    return "Normal";
  };

  const getStatusDot = (label) => {
    let color = "#22c55e";

    if (label === "Low") color = "#f59e0b";
    if (label === "Expired") color = "#ef4444";

    return (
      <span
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

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!selectedId) {
      setErr("Please select an item");
      return;
    }

    if (newQty === "") {
      setErr("Please enter a quantity");
      return;
    }

    const qtyNumber = Number(newQty);

    if (Number.isNaN(qtyNumber) || qtyNumber < 0) {
      setErr("Quantity must be 0 or more");
      return;
    }

    try {
      const res = await api.put(`/items/${selectedId}`, {
        quantity: qtyNumber,
      });

      setMsg(res.data.message || "Stock updated successfully");
      setNewQty("");
      await loadItems();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update stock");
    }
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">Update Stock</h2>

      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <div className="glass-panel" style={{ padding: "24px", marginBottom: "24px", maxWidth: "500px" }}>
        <form onSubmit={handleSave}>
          <label style={{ display: "block", marginBottom: "8px" }}>Select Item</label>
          <select
            value={selectedId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedId(id);

              const found = items.find((item) => item._id === id);
              if (found) {
                setNewQty(found.quantity);
              } else {
                setNewQty("");
              }
            }}
            style={{ marginBottom: "16px" }}
          >
            <option value="">-- Choose --</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.category}) - Qty: {item.quantity}
              </option>
            ))}
          </select>

          <label style={{ display: "block", marginBottom: "8px" }}>New Qty</label>
          <input
            type="number"
            min="0"
            placeholder="Enter new quantity"
            value={newQty}
            onChange={(e) => setNewQty(e.target.value)}
            style={{ marginBottom: "16px" }}
          />

          <button className="primary-btn" type="submit">
            Save
          </button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3 style={{ marginBottom: "12px" }}>Inventory List</h3>

        <p style={{ marginBottom: "16px" }}>
          Status Indication:
          <span style={{ marginLeft: "10px", verticalAlign: "middle" }}>
            {getStatusDot("Normal")}
          </span>
          <span style={{ marginLeft: "6px", marginRight: "12px" }}>Normal</span>

          <span style={{ verticalAlign: "middle" }}>
            {getStatusDot("Low")}
          </span>
          <span style={{ marginLeft: "6px", marginRight: "12px" }}>Low</span>

          <span style={{ verticalAlign: "middle" }}>
            {getStatusDot("Expired")}
          </span>
          <span style={{ marginLeft: "6px" }}>Expired</span>
        </p>

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
                  <th align="left">Supplier</th>
                  <th align="left">Expiry</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const label = getItemStatus(item.quantity, item.reorderLevel);
                  const isLow = label === "Low";
                  const isExpired = label === "Expired";

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
                      <td>{item.supplier || "-"}</td>
                      <td>
                        {item.expiryDate
                          ? new Date(item.expiryDate).toISOString().split("T")[0]
                          : "-"}
                      </td>
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

export default UpdateStock;