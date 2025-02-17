export const parseCookieHeader = (cookieHeader: string) => {
  if (!cookieHeader) return {};
  const cookie = {} as { [key: string]: string };

  // Split the cookie header into individual cookies
  cookieHeader.split(';').forEach((cookieStr) => {
    const [key, value] = cookieStr.split('=');
    cookie[key.trim()] = value;
  });

  return cookie;
}