import { NextResponse } from "next/server";
import { localPermissions } from "./constants/permissions";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api/v1";

export async function proxy(request) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // -------------------------------
  // 1️⃣ Read cookies
  // -------------------------------
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value
    ? JSON.parse(request.cookies.get("isAuthenticated")?.value)
    : false;
  console.log("refreshToken", refreshToken);
  console.log("accessToken", accessToken);
  console.log("typeof isAuthenticated", typeof isAuthenticated);

  // const refreshToken = request.cookies.get("refreshToken")?.value;

  // -------------------------------
  // 2️⃣ Parse userInfo cookie safely
  // -------------------------------
  // let userInfo = {};
  // const userInfoCookie = request.cookies.get("userInfo")?.value;
  // if (userInfoCookie) {
  //   try {
  //     userInfo = JSON.parse(userInfoCookie);
  //   } catch (err) {
  //     console.error("Failed to parse userInfo cookie:", err);
  //   }
  // }

  // const permissions = userInfo?.permissions;
  // const section = pathname.split("/admin/")[1]?.split("/")[0];

  // -------------------------------
  // 3️⃣ Skip static & API assets
  // -------------------------------
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // -------------------------------
  // 4️⃣ Redirect logged-in users away from "/"
  // -------------------------------
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // -------------------------------
  // 5️⃣ Handle admin pages (auth + permission)
  // -------------------------------
  if (pathname.startsWith("/admin")) {
    // 🔹 If not logged in → check backend
    if (!isAuthenticated) {
      console.log("isAuthenticated is false");

      try {
        const res = await fetch(`${backendUrl}/admin/check-auth`, {
          method: "POST",
          headers: { Cookie: `refreshToken=${refreshToken}` },
        });

        const data = await res.json();
        console.log("data", data);

        if (!data?.isAuthenticated) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (error) {
        console.error("check-auth request failed", error);
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    //   // 🔹 Permission check
    //   const permissionKey = localPermissions[section];
    //   if (
    //     !permissions?.[permissionKey] ||
    //     permissions?.[permissionKey] === "none"
    //   ) {
    //     return NextResponse.redirect(new URL("/", request.url));
    //   }
  }

  // -------------------------------
  // ✅ Allow public "/" when not logged in
  // -------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};
