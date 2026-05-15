// utils/setCookies.ts
import Cookies from "js-cookie";

const getClientCookieOptions = (expires = 90) => {
  const isHttps =
    typeof window !== "undefined" && window.location.protocol === "https:";

  return {
    path: "/",
    secure: isHttps,
    sameSite: isHttps ? "None" : "Lax",
    expires,
  };
};

export const setAuthCookies = ({
  accessToken,
  refreshToken,
  userInfo,
  isAuthenticated = true,
}) => {
  const options = getClientCookieOptions();

  if (accessToken) {
    Cookies.set("accessToken", accessToken, options);
  }

  if (refreshToken) {
    Cookies.set("refreshToken", refreshToken, options);
  }

  Cookies.set(
    "isAuthenticated",
    JSON.stringify(Boolean(isAuthenticated)),
    options,
  );

  Cookies.set(
    "userInfo",
    typeof userInfo === "string" ? userInfo : JSON.stringify(userInfo),
    options,
  );
};

export const setSessionMetaCookies = ({
  userInfo,
  isAuthenticated = true,
  expires = 90,
}) => {
  const options = getClientCookieOptions(expires);
  Cookies.set(
    "isAuthenticated",
    JSON.stringify(Boolean(isAuthenticated)),
    options,
  );

  if (userInfo) {
    Cookies.set(
      "userInfo",
      typeof userInfo === "string" ? userInfo : JSON.stringify(userInfo),
      options,
    );
  }
};

export const removeAuthCookies = () => {
  // Remove cookies with multiple attribute combinations to avoid
  // environment mismatch (http/https, SameSite variants).
  const variants = [
    { path: "/" },
    { path: "/", sameSite: "Lax" },
    { path: "/", secure: true, sameSite: "None" },
  ];

  for (const options of variants) {
    Cookies.remove("accessToken", options);
    Cookies.remove("refreshToken", options);
    Cookies.remove("isAuthenticated", options);
    Cookies.remove("userInfo", options);
  }
};
