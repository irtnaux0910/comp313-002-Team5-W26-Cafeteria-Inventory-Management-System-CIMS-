import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosClient";

export default function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setErr("");
      setMsg("");
      setLoadingProfile(true);

      try {
        const res = await api.get("/users/me");

        setForm({
          name: res.data.user?.name || "",
          email: res.data.user?.email || "",
        });
      } catch (e) {
        const status = e?.response?.status;

        // If token expired/invalid, log out and redirect
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        setErr(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    try {
      const res = await api.put("/users/me", payload);

      setMsg(res.data.message || "Profile updated!");

      // keep navbar info updated
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (e) {
      const status = e?.response?.status;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      setErr(e?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <div className="card" style={{ maxWidth: "520px", margin: "0 auto" }}>
        <h2>My Profile</h2>

        {loadingProfile && <p>Loading profile...</p>}

        {!loadingProfile && (
          <>
            {msg && <p className="success">{msg}</p>}
            {err && <p className="error">{err}</p>}

            <form onSubmit={save}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                required
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}