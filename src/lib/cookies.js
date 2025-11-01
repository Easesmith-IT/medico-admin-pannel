// utils/setCookies.ts
import Cookies from "js-cookie";

export const setAuthCookies = ({
  accessToken,
  refreshToken,
  userInfo,
  isAuthenticated = true,
}) => {
  Cookies.set("accessToken", accessToken, {
    path: "/",
    secure: true,
    sameSite: "None",
    expires: 90, // 90 days
  });

  Cookies.set("refreshToken", refreshToken, {
    path: "/",
    secure: true,
    sameSite: "None",
    expires: 90, // 90 days
  });

  Cookies.set("isAuthenticated", isAuthenticated, {
    path: "/",
    secure: true,
    sameSite: "None",
    expires: 90,
  });

  Cookies.set("userInfo", userInfo, {
    path: "/",
    secure: true,
    sameSite: "None",
    expires: 90,
  });
};

export const removeAuthCookies = () => {
  const options = { path: "/" }; // must match set options
  Cookies.remove("accessToken", options);
  Cookies.remove("refreshToken", options);
  Cookies.remove("isAuthenticated", options);
  Cookies.remove("userInfo", options);
};
