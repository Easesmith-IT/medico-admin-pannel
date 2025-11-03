// app/actions/logout.ts
"use server";

import { cookies } from "next/headers";


export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.getAll().forEach((cookie) => {
    cookieStore.set({
      name: cookie.name,
      value: "",
      expires: new Date(0),
      path: "/",
    });
  });
}
