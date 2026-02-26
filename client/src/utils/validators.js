export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function validatePassword(pw) {
  // simple + acceptable for class project
  // min 8 chars, at least 1 number
  const okLength = pw.length >= 8;
  const hasNumber = /\d/.test(pw);
  return {
    ok: okLength && hasNumber,
    message: "Password must be at least 8 characters and include 1 number.",
  };
}