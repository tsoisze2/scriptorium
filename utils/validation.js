export function isValidEmail(email) {
  // Regular expression for basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhoneNumber(phone) {
  // Regular expression for validating phone numbers (with or without country code)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password) {
  return password.length >= 8;
}

export function isValidName(name) {
  return typeof name === "string" && name.length >= 2 && name.length <= 50;
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}