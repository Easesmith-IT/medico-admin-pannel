import Cookies from "js-cookie";

export const readCookie = (name) => {
  const cookieValue = Cookies.get(name);
  if (!cookieValue) return undefined;

  try {
    return JSON.parse(cookieValue);
  } catch {
    return cookieValue;
  }
};
