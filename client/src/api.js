const API_URL = "http://localhost:5000/api/auth";

async function request(path, payload) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    // ignore json parse errors
  }

  if (!res.ok || data?.success === false) {
    // backend uses {success:false, message:"..."}
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

export const loginUser = (credentials) => request("/login", credentials);
export const registerUser = (userData) => request("/register", userData);