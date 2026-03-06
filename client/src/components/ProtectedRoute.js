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

const ProtectedRoute = ({ children }) => {
  const [authorized, setAuthorized] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) return setAuthorized(false);

      const decoded = decodeJwt(token);
      if (!decoded?.exp) return setAuthorized(false);

      const expiryMs = decoded.exp * 1000;
      if (Date.now() >= expiryMs) return setAuthorized(false);

      setAuthorized(true);
    };

    checkAuth();

    const interval = setInterval(checkAuth, 1000);

    const onStorage = () => checkAuth();
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!authorized) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;