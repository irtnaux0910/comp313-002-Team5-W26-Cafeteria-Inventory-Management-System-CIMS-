import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!token || !user) {
        setStatus("unauthorized");
        return;
      }

      const decoded = decodeJwt(token);

      if (!decoded?.exp) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("unauthorized");
        return;
      }

      if (Date.now() >= decoded.exp * 1000) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setStatus("unauthorized");
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        setStatus("forbidden");
        return;
      }

      setStatus("authorized");
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, [allowedRoles]);

  if (status === "checking") return null;
  if (status === "unauthorized") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;