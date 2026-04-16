import { useEffect, useState } from "react";
import api from "../api/axiosClient";

function Messages() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [contacts, setContacts] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const loadContacts = async () => {
    try {
      const res = await api.get("/messages/contacts");
      setContacts(res.data.contacts || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load contacts");
    }
  };

  const loadMessages = async (otherUserId) => {
    if (!otherUserId) {
      setMessages([]);
      return;
    }

    try {
      const res = await api.get(`/messages/${otherUserId}`);
      setMessages(res.data.messages || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load messages");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    loadMessages(selectedUserId);

    let interval;

    if (selectedUserId) {
      interval = setInterval(() => {
        loadMessages(selectedUserId);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedUserId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!selectedUserId) {
      setErr("Please select a contact");
      return;
    }

    if (!text.trim()) {
      setErr("Message cannot be empty");
      return;
    }

    try {
      const res = await api.post("/messages", {
        receiverId: selectedUserId,
        text,
      });

      if (res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
      }

      setText("");
      setMsg("Message sent");
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to send message");
    }
  };

  return (
    <div className="page-shell">
      <h2 className="page-title">Messages</h2>

      {msg && <p className="success">{msg}</p>}
      {err && <p className="error">{err}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "20px",
        }}
      >
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "12px" }}>
            {currentUser?.role === "admin" ? "Users" : "Admins"}
          </h3>

          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{ marginBottom: "16px" }}
          >
            <option value="">-- Select Contact --</option>
            {contacts.map((contact) => (
              <option key={contact._id} value={contact._id}>
                {contact.name} ({contact.email})
              </option>
            ))}
          </select>
        </div>

        <div className="glass-panel" style={{ padding: "20px" }}>
          <h3 style={{ marginBottom: "12px" }}>Conversation</h3>

          <div
            style={{
              minHeight: "320px",
              maxHeight: "420px",
              overflowY: "auto",
              padding: "12px",
              borderRadius: "16px",
              background: "rgba(255,255,255,0.04)",
              marginBottom: "16px",
            }}
          >
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((message) => {
                const isMine = message.senderId === currentUser?.id;

                return (
                  <div
                    key={message._id}
                    style={{
                      display: "flex",
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "10px 14px",
                        borderRadius: "14px",
                        background: isMine
                          ? "rgba(59,130,246,0.25)"
                          : "rgba(255,255,255,0.10)",
                        color: "#fff",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>{message.text}</div>
                      <small style={{ opacity: 0.7 }}>
                        {new Date(message.createdAt).toLocaleString()}
                      </small>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={sendMessage}>
            <textarea
              rows="3"
              placeholder="Type your message here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                resize: "none",
                marginBottom: "12px",
              }}
            />

            <button className="primary-btn" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Messages;