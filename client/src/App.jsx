import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import UserDashboard from "./components/UserDashboard.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import AdminUsers from "./components/AdminUsers.jsx";
import AdminOrders from "./components/AdminOrders.jsx";
import Messages from "./components/Messages.jsx";
import Profile from "./components/Profile.jsx";
import Inventory from "./components/Inventory.jsx";
import UpdateStock from "./components/UpdateStock.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function RoleBasedDashboardRedirect() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/user/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RoleBasedDashboardRedirect />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/update-stock"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UpdateStock />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/inventory"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/messages"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;