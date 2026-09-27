const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function isValidEmail(email: string) {
  return email.length <= 254 && emailPattern.test(email);
}

export function isValidPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}