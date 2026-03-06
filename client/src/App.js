import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UpdateStock from "./components/UpdateStock";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          
        />

        <Route
        path="/update-stock"
        element={
          <ProtectedRoute>
            <UpdateStock />
          </ProtectedRoute>
  }
/>
      </Routes>
    </>
  );
}

export default App;