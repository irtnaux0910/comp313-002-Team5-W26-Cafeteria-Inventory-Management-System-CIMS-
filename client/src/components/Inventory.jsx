import { useEffect, useState } from "react";
import api from "../api/axiosClient";

function Inventory() {
  const [items, setItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    supplier: "",
    quantity: 0,
    reorderLevel: 5,
    expiryDate: "",
  });

  const loadItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load inventory");
    }
  };

  const loadMyOrders = async () => {
    try {
      const res = await api.get("/orders/my");
      setMyOrders(res.data.orders || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load your orders");
    }
  };

  useEffect(() => {
    loadItems();
    loadMyOrders();

    const interval = setInterval(() => {
      loadMyOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    try {
      const payload = {
        name: form.name,
        category: form.category,
        supplier: form.supplier,
        quantity: Number(form.quantity),
        reorderLevel: Number(form.reorderLevel),
        expiryDate: form.expiryDate || null,
      };

      const itemRes = await api.post("/items", payload);
      const createdItem = itemRes.data.item;

      const orderRes = await api.post("/orders", {
        items: [
          {
            itemId: createdItem?._id,
            name: createdItem?.name,
            category: createdItem?.category,
            quantity: createdItem?.quantity,
            expiryDate: createdItem?.expiryDate,
            supplier: createdItem?.supplier,
            reorderLevel: createdItem?.reorderLevel,
          },
        ],
      });

      const newOrder = orderRes.data.order;
      if (newOrder) {
        setMyOrders((prev) => [newOrder, ...prev]);
      }

      setMsg("Item added and reflected to admin orders");
      setForm({
        name: "",
        category: "",
        supplier: "",
        quantity: 0,
        reorderLevel: 5,
        expiryDate: "",
      });

      loadItems();
      loadMyOrders();
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    }
  };

  const clearNotification = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/clear`);
      setMyOrders((prev) => prev.filter((o) => o._id !== orderId));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to clear notification");
    }
  };

  const getOrderStatusStyle = (status) => {
    if (status === "approved") {
      return { color: "#22c55e", fontWeight: "bold" };
    }
    if (status === "rejected") {
      return { color: "#ef4444", fontWeight: "bold" };
    }
    return { color: "#fbbf24", fontWeight: "bold" };
  };

  const renderStatusText = (status) => {
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    return "Pending Approval";
  };

  const getInventoryStatus = (quantity, reorderLevel) => {
    if (quantity <= 0) return "Expired";
    if (quantity <= reorderLevel) return "Low Stock";
    return "In Stock";
  };

  const getInventoryStatusStyle = (status) => {
    if (status === "In Stock") {
      return { color: "#22c55e", fontWeight: "bold" };
    }
    if (status === "Low Stock") {
      return { color: "#f59e0b", fontWeight: "bold" };
    }
    return { color: "#ef4444", fontWeight: "bold" };
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Inventory</h2>

      {msg && (
        <div
          style={{
            backgroundColor: "#14532d",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          {msg}
        </div>
      )}

      {err && (
        <div
          style={{
            backgroundColor: "#7f1d1d",
            color: "white",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "15px",
          }}
        >
          {err}
        </div>
      )}

      <form
        onSubmit={submit}
        style={{
          backgroundColor: "#374151",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          maxWidth: "500px",
        }}
      >
        <h3>Add Item</h3>

        <input
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="category"
          placeholder="Category (e.g., Drinks)"
          value={form.category}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <input
          name="supplier"
          placeholder="Supplier"
          value={form.supplier}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="number"
          name="reorderLevel"
          placeholder="Reorder Level"
          value={form.reorderLevel}
          onChange={handleChange}
          style={inputStyle}
        />

        <input
          type="date"
          name="expiryDate"
          value={form.expiryDate}
          onChange={handleChange}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Add Item
        </button>
      </form>

      <div
        style={{
          backgroundColor: "#374151",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
        }}
      >
        <h3>My Order Requests</h3>

        {myOrders.length === 0 ? (
          <p>No order requests yet.</p>
        ) : (
          <table width="100%" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Item</th>
                <th align="left">Category</th>
                <th align="left">Qty</th>
                <th align="left">Status</th>
                <th align="left">Date</th>
                <th align="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) =>
                order.items.map((item, index) => (
                  <tr key={`${order._id}-${index}`}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span style={getOrderStatusStyle(order.status)}>
                        {renderStatusText(order.status)}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      {order.status !== "pending" ? (
                        <button
                          onClick={() => clearNotification(order._id)}
                          style={clearButtonStyle}
                        >
                          Clear
                        </button>
                      ) : (
                        <span
                          style={{
                            color: "#fbbf24",
                            fontWeight: "bold",
                          }}
                        >
                          On Queue
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div
        style={{
          backgroundColor: "#374151",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Items List</h3>

        <table width="100%" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Category</th>
              <th align="left">Qty</th>
              <th align="left">Reorder</th>
              <th align="left">Status</th>
              <th align="left">Expiry</th>
              <th align="left">Supplier</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getInventoryStatus(
                item.quantity,
                item.reorderLevel
              );

              return (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.reorderLevel}</td>
                  <td>
                    <span style={getInventoryStatusStyle(status)}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {item.expiryDate
                      ? new Date(item.expiryDate).toISOString().split("T")[0]
                      : "-"}
                  </td>
                  <td>{item.supplier}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginBottom: "10px",
  padding: "8px",
  borderRadius: "5px",
  border: "none",
};

const buttonStyle = {
  padding: "8px 12px",
  backgroundColor: "#e5e7eb",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const clearButtonStyle = {
  padding: "5px 10px",
  backgroundColor: "#6b7280",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default Inventory;