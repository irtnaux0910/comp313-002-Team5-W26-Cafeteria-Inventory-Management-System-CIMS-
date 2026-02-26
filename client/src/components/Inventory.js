import { useEffect, useState } from "react";
import api from "../api/axiosClient";

const emptyForm = {
  name: "",
  category: "",
  quantity: 0,
  expiryDate: "",
  supplier: "",
  reorderLevel: 5,
};

// allow empty expiryDate, but if provided it must be > today
const isFutureDate = (yyyyMmDd) => {
  if (!yyyyMmDd) return true;
  const selected = new Date(yyyyMmDd + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected > today;
};

const minDate = () => {
  const t = new Date();
  t.setDate(t.getDate() + 1); // tomorrow
  return t.toISOString().slice(0, 10);
};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const loadItems = async () => {
    try {
      const res = await api.get("/items");
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load items");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const onChange = (e) => {
    setMsg("");
    setErr("");
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "quantity" || name === "reorderLevel" ? Number(value) : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      if (!form.name.trim()) {
        setErr("Item name is required");
        setLoading(false);
        return;
      }

      // ✅ expiry date validation
      if (form.expiryDate && !isFutureDate(form.expiryDate)) {
        setErr("Expiry date must be a future date");
        setLoading(false);
        return;
      }

      const payload = {
        ...form,
        name: form.name.trim(),
        category: form.category.trim(),
        supplier: form.supplier.trim(),
      };

      if (editingId) {
        const res = await api.put(`/items/${editingId}`, payload);
        setMsg(res.data.message || "Item updated");
      } else {
        const res = await api.post("/items", payload);
        setMsg(res.data.message || "Item added");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadItems();
    } catch (e) {
      setErr(e?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setMsg("");
    setErr("");
    setEditingId(item._id);

    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity ?? 0,
      expiryDate: item.expiryDate ? String(item.expiryDate).slice(0, 10) : "",
      supplier: item.supplier || "",
      reorderLevel: item.reorderLevel ?? 5,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const remove = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) return;

    setMsg("");
    setErr("");

    try {
      const res = await api.delete(`/items/${id}`);
      setMsg(res.data.message || "Item deleted");
      await loadItems();
    } catch (e) {
      setErr(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Inventory</h2>

      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
        <h3>{editingId ? "Edit Item" : "Add Item"}</h3>

        <form onSubmit={submit}>
          <input
            name="name"
            placeholder="Item name"
            value={form.name}
            onChange={onChange}
            required
          />

          <input
            name="category"
            placeholder="Category (e.g., Drinks)"
            value={form.category}
            onChange={onChange}
          />

          <input
            name="supplier"
            placeholder="Supplier"
            value={form.supplier}
            onChange={onChange}
          />

          <input
            name="quantity"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={onChange}
            min="0"
          />

          <input
            name="reorderLevel"
            type="number"
            placeholder="Reorder level"
            value={form.reorderLevel}
            onChange={onChange}
            min="0"
          />

          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={onChange}
            min={minDate()}   // ✅ future only (tomorrow onwards)
          />

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>

            {editingId && (
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: "20px" }}>
        <h3>Items List</h3>

        {items.length === 0 ? (
          <p>No items yet. Add your first item above.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Name</th>
                <th align="left">Category</th>
                <th align="left">Qty</th>
                <th align="left">Reorder</th>
                <th align="left">Expiry</th>
                <th align="left">Supplier</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it._id}>
                  <td>{it.name}</td>
                  <td>{it.category}</td>
                  <td>{it.quantity}</td>
                  <td>{it.reorderLevel}</td>
                  <td>{it.expiryDate ? String(it.expiryDate).slice(0, 10) : "-"}</td>
                  <td>{it.supplier || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => startEdit(it)}>Edit</button>
                      <button onClick={() => remove(it._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}