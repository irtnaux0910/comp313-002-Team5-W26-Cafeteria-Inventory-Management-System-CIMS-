import { useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient";

function Inventory() {
  const [items, setItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

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
          <h3 style={{ margin: 0 }}>Items List</h3>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by item name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 0, minWidth: "220px" }}
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="default">Default</option>
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="lowStock">Low Stock First</option>
            </select>
          </div>
        </div>

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
            {filteredAndSortedItems.map((item) => {
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
  backgroundColor: "#4b5563",
  color: "white",
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

const selectStyle = {
  padding: "8px 12px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "#4b5563",
  color: "white",
  minWidth: "180px",
};

export default Inventory;