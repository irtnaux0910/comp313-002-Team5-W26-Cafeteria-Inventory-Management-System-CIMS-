import { useEffect, useState } from "react";
import api from "../api/axiosClient";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const loadUsers = async () => {
    try {
      setErr("");
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const blockUser = async (id) => {
    try {
      setMsg("");
      setErr("");
      const res = await api.patch(`/users/${id}/block`);
      setMsg(res.data.message || "User has been blocked");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to block user");
    }
  };

  const unblockUser = async (id) => {
    try {
      setMsg("");
      setErr("");
      const res = await api.patch(`/users/${id}/unblock`);
      setMsg(res.data.message || "User has been unblocked");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to unblock user");
    }
  };

  const deleteUser = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setMsg("");
      setErr("");
      const res = await api.delete(`/users/${id}`);
      setMsg(res.data.message || "User deleted successfully");
      await loadUsers();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">Manage Users</h2>

      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <div className="glass-panel" style={{ padding: "24px" }}>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th align="left">Name</th>
                  <th align="left">Email</th>
                  <th align="left">Role</th>
                  <th align="left">Status</th>
                  <th align="left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isCurrentUser = currentUser?.id === user._id;

                  return (
                    <tr key={user._id}>
                      <td>{user.name || "-"}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.status === "blocked" ? (
                          <span className="status-low">Blocked</span>
                        ) : (
                          <span className="status-good">Active</span>
                        )}
                      </td>
                      <td>
                        <div className="action-group">
                          {!isCurrentUser && user.status !== "blocked" && (
                            <button
                              className="secondary-btn"
                              onClick={() => blockUser(user._id)}
                            >
                              Block
                            </button>
                          )}

                          {!isCurrentUser && user.status === "blocked" && (
                            <button
                              className="primary-btn"
                              onClick={() => unblockUser(user._id)}
                            >
                              Unblock
                            </button>
                          )}

                          {!isCurrentUser && (
                            <button
                              className="danger-btn"
                              onClick={() => deleteUser(user._id)}
                            >
                              Delete
                            </button>
                          )}

                          {isCurrentUser && <span>You</span>}
                        </div>
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

export default AdminUsers;