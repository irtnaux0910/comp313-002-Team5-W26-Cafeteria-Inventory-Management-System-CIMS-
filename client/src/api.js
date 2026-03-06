const API_URL = "http://localhost:5000/api/auth";

const forceLogout = () => {
  localStorage.clear();
  window.location.href = "/login";
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    return data;
  }

  if (data?.token) localStorage.setItem("token", data.token);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  return response.json();
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    forceLogout();
    return;
  }

  const response = await fetch(`http://localhost:5000${endpoint}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401 || response.status === 403) {
    forceLogout();
    return;
  }

  return response.json();
};