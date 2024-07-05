import { createCookie  } from "@remix-run/node";

export const sessionCookie = createCookie("session", {
  maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});
