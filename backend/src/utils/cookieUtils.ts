import { Response, Request } from 'express';

export const clearCookie = (res: Response, name: string) => {
  res.clearCookie(name)
}

export const getAuthBearerToken = (req: Request) => {
  // use secret to read token from Authorization header
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.split(' ')[1];
}

export const getCookie = (req: Request, name: string) => {
  return req.signedCookies[name]
}

export const setCookie = (res: Response, name: string, value:string, options = {}) => {

  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // strict for production, lax for development
    maxAge: 1000 * 60 * 60, // 1 hour
    domain: 'localhost',
    ...options
  });
}

