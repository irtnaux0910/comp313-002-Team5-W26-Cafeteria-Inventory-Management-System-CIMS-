import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../apiClient";

function UpdateStock() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleUnauthorized = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const fetchItems = async () => {
    try {
      const res = await apiClient.get(`/api/inventory?t=${Date.now()}`);
      const list = Array.isArray(res.data) ? res.data : res.data.items || [];
      setItems(list);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized();
      } else {
        setStatus(err?.response?.data?.message || "Failed to load inventory");
      }
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const selectedItem = useMemo(
    () => items.find((x) => x._id === selectedId),
    [items, selectedId]
  );

  useEffect(() => {
    if (selectedItem) {
      setQty(String(selectedItem.qty ?? ""));
    }
  }, [selectedItem]);

  const submit = async (e) => {
    e.preventDefault();
    setStatus("");

    if (!selectedId) {
      setStatus("Please select an item");
      return;
    }

    if (qty === "" || Number.isNaN(Number(qty))) {
      setStatus("Enter a valid quantity");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.put(`/api/inventory/${selectedId}`, {
        qty: Number(qty),
      });

      setStatus(res.data?.message || "Stock updated successfully");
      await fetchItems();
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized();
      } else {
        setStatus(err?.response?.data?.message || "Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Update Stock</h2>

      <form onSubmit={submit} style={{ maxWidth: 520 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Select Item</label>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
        >
          <option value="">-- Choose --</option>
          {items.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name} ({item.category || "Uncategorized"}) - Current:{" "}
              {item.qty ?? 0}
            </option>
          ))}
        </select>

        {selectedItem ? (
          <p style={{ marginTop: 0, marginBottom: 14 }}>
            Current Qty: <b>{selectedItem.qty ?? 0}</b>{" "}
            <span style={{ marginLeft: 10 }}>
              Status: {getStatusDot(getItemStatus(selectedItem.qty))}
            </span>
          </p>
        ) : (
          <p style={{ marginTop: 0, marginBottom: 14 }}>Please select an item</p>
        )}

        <label style={{ display: "block", marginBottom: 6 }}>New Qty</label>
        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 14 }}
          placeholder="Enter new quantity"
        />

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "10px 14px", width: "100%" }}
        >
          {loading ? "Saving..." : "Save"}
        </button>

        {status && <p style={{ marginTop: 12 }}>{status}</p>}
      </form>

      <hr style={{ margin: "24px 0" }} />

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

      <div style={{ maxWidth: 800 }}>
        {items.length === 0 ? (
          <p>No items yet.</p>
        ) : (
          <table
            width="100%"
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse" }}
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
              {items.map((i) => {
                const label = getItemStatus(i.qty);
                return (
                  <tr key={i._id}>
                    <td>{i.name}</td>
                    <td>{i.category || "-"}</td>
                    <td>{i.qty ?? 0}</td>
                    <td>{getStatusDot(label)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UpdateStock;