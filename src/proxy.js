import { NextResponse } from "next/server";
import { localPermissions } from "./constants/permissions";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeRole = (role = "") =>
  String(role || "")
    .toLowerCase()
    .replace(/[_\s]/g, "");

const normalizePathSection = (pathname = "") =>
  pathname.split("/admin/")[1]?.split("/")[0] || "";

const hasPermission = (userInfo, permissionKey) => {
  if (!permissionKey) return true;

  const role = normalizeRole(userInfo?.role);
  if (role === "superadmin") return true;

  const permissions = userInfo?.permissions;
  if (Array.isArray(permissions)) return permissions.includes(permissionKey);

  if (permissions && typeof permissions === "object") {
    const value = permissions[permissionKey];
    return value === true || value === "read" || value === "write";
  }

  return false;
};

const resolveSessionFromBackend = async (request) => {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const response = await fetch(`${backendUrl}/admin/check-auth`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) return { isAuthenticated: false, userInfo: null };
    const payload = await response.json();
    return {
      isAuthenticated: Boolean(payload?.isAuthenticated),
      userInfo: payload?.data || null,
    };
  } catch {
    return { isAuthenticated: false, userInfo: null };
  }
};

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const userInfoFromCookie = safeParseJson(
    request.cookies.get("userInfo")?.value
  );
  const isAuthCookieRaw = request.cookies.get("isAuthenticated")?.value;
  const isAuthCookie = safeParseJson(isAuthCookieRaw);

  let isAuthenticated = Boolean(
    typeof isAuthCookie === "boolean" ? isAuthCookie : isAuthCookieRaw === "true"
  );
  let userInfo = userInfoFromCookie;

  const hasAuthTokens =
    Boolean(request.cookies.get("accessToken")?.value) ||
    Boolean(request.cookies.get("refreshToken")?.value);

  if ((!isAuthenticated || !userInfo) && hasAuthTokens) {
    const session = await resolveSessionFromBackend(request);
    isAuthenticated = session.isAuthenticated;
    userInfo = session.userInfo;
  }

  if (pathname === "/") {
    if (isAuthenticated) {
      const response = NextResponse.redirect(
        new URL("/admin/dashboard", request.url)
      );
      if (userInfo) {
        response.cookies.set("userInfo", JSON.stringify(userInfo), { path: "/" });
      }
      response.cookies.set("isAuthenticated", JSON.stringify(true), {
        path: "/",
      });
      return response;
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.cookies.delete("userInfo");
      response.cookies.delete("isAuthenticated");
      return response;
    }

    const section = normalizePathSection(pathname);
    const permissionKey = localPermissions[section];

    if (!hasPermission(userInfo, permissionKey)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    const response = NextResponse.next();
    if (userInfo) {
      response.cookies.set("userInfo", JSON.stringify(userInfo), { path: "/" });
    }
    response.cookies.set("isAuthenticated", JSON.stringify(true), { path: "/" });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};

