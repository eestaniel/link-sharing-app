import { createCookie  } from "@remix-run/node";
import {redirect} from "@remix-run/react"

// Define the cookie secrets
const cookieSecret = [
  process.env.SESSION_SECRET!,
]


const sessionCookie = createCookie("session", {
  maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  secrets: cookieSecret,
  sameSite: "lax",
});


const parseCookieHeader = (cookieHeader: string) => {
  if (!cookieHeader) return {};
  const cookie = {} as { [key: string]: string };

  // Split the cookie header into individual cookies
  cookieHeader.split(';').forEach((cookieStr) => {
    const [key, value] = cookieStr.split('=');
    cookie[key.trim()] = value;
  });

  return cookie;
}

// function to validate the cookie session
export const validateCookieSession = async (request: Request, page: string): Promise<Response | void> => {
  const cookieHeader = request.headers.get('Cookie') as string
  const cookie = parseCookieHeader(cookieHeader) as { [key: string]: string };


  // if login page and session cookie, return redirect /dashboard/links
  if (page === '/' && cookie.sb_session) {
    console.log('redirecting to dashboard')
    return redirect('/dashboard/links');
  }

  // if dashboard page and no session cookie, return redirect / and delete cookie
  else if (page === '/dashboard' && !cookie.sb_session) {
    return redirect('/', {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }

  console.log('is valid')

}


