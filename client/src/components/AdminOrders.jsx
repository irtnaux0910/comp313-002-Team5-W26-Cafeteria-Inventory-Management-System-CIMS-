import { useEffect, useState } from "react";
import api from "../api/axiosClient";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadOrders = async () => {
    try {
      setErr("");
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setMsg("");
      setErr("");

      const res = await api.patch(`/orders/${id}/status`, { status });
      setMsg(res.data.message || "Order status updated successfully");

      await loadOrders();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update order status");
    }
  };

  const clearOrder = async (id) => {
    try {
      setMsg("");
      setErr("");

      const res = await api.delete(`/orders/${id}`);
      setMsg(res.data.message || "Order cleared successfully");

      setOrders((prev) => prev.filter((order) => order._id !== id));
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to clear order");
    }
  };

  const getStatusStyle = (status) => {
    if (status === "approved") {
      return { color: "#22c55e", fontWeight: "bold" };
    }

    if (status === "rejected") {
      return { color: "#ef4444", fontWeight: "bold" };
    }

    return { color: "#fbbf24", fontWeight: "bold" };
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">User Orders</h2>

      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <div className="glass-panel" style={{ padding: "24px" }}>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th align="left">User</th>
                  <th align="left">Email</th>
                  <th align="left">Item</th>
                  <th align="left">Category</th>
                  <th align="left">Qty</th>
                  <th align="left">Supplier</th>
                  <th align="left">Expiry</th>
                  <th align="left">Status</th>
                  <th align="left">Date</th>
                  <th align="left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.flatMap((order) =>
                  (order.items || []).map((item, index) => (
                    <tr key={`${order._id}-${index}`}>
                      <td>{order.userId?.name || "-"}</td>
                      <td>{order.userId?.email || "-"}</td>
                      <td>{item.name || "-"}</td>
                      <td>{item.category || "-"}</td>
                      <td>{item.quantity ?? 0}</td>
                      <td>{item.supplier || "-"}</td>
                      <td>
                        {item.expiryDate
                          ? String(item.expiryDate).slice(0, 10)
                          : "-"}
                      </td>
                      <td>
                        <span style={getStatusStyle(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            onClick={() => updateStatus(order._id, "approved")}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#22c55e",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => updateStatus(order._id, "rejected")}
                            style={{
                              padding: "8px 12px",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontWeight: "600",
                            }}
                          >
                            Reject
                          </button>

                          {order.status !== "pending" && (
                            <button
                              onClick={() => clearOrder(order._id)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#6b7280",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;