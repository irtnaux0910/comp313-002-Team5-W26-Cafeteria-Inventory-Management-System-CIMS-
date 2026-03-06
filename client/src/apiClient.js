import axios from "axios";

/*
  apiClient.js

  This file creates a reusable Axios client used for all API requests in the application.
  Instead of repeating the server URL and headers in every component, we centralize the
  configuration here.

  The apiClient automatically attaches the authentication token stored in localStorage
  to every request. This allows the backend to verify the logged-in user when accessing
  protected routes such as inventory operations.

  Using a single API client also keeps the code cleaner and easier to maintain across
  different pages like Dashboard and UpdateStock.
*/

const apiClient = axios.create({
  baseURL: "http://localhost:5000",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default apiClient;