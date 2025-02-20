import { Response, Request } from 'express';



export const setCookie = (res: Response, name: string, value:string, options = {}) => {

  res.cookie(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 week
    domain: process.env.DOMAIN,
    ...options
  });
}

