import { createCookie  } from "@remix-run/node";

const cookieSecrets = [
  process.env.SESSION_SECRET!,
]

export const sessionCookie = createCookie("session", {
  maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  secrets: cookieSecrets,
  sameSite: "lax",
});
