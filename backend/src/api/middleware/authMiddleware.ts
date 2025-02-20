import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";
import supabase from "../../config/supabaseClient";
import {setCookie} from "../../utils/cookieUtils"


interface User {
  id: string;
  email: string;
}


interface TokensPayload {
  access_token: string;
  refresh_token: string;
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie and check if it exists
    const cookie = req.cookies.sb_session;
    if (!cookie) {
      return res.status(401).json({message: "Unauthorized"});
    }




    let tokens: TokensPayload;
    let user: User;
    try {
      tokens = jwt.verify(cookie, process.env.JWT_SECRET as string) as TokensPayload;
      user = jwt.verify(tokens.access_token, process.env.JWT_SECRET as string) as User;
      req.user = user;
      req.tokens = tokens;
      return next(); // Proceed to the next middleware or route handler
    } catch (error) {
      // Access token expired, attempt refresh
      console.log('Access token expired, attempting refresh');
      try {
        tokens = jwt.decode(cookie, process.env.JWT_SECRET as any) as any;
        const refresh_token = tokens?.refresh_token as string;
        const {
          data,
          error
        } = await supabase.auth.refreshSession({refresh_token})
        const {session, user} = data
        console.log('new session received');

        console.log('setting new req.user and req.tokens');

        req.user = user;
        req.tokens = {
          access_token: session?.access_token as string,
          refresh_token: session?.refresh_token as string
        }

        console.log('successfully refreshed token');

        // create new payload
        const jwtPayload = {
          access_token: session?.access_token,
          refresh_token: session?.refresh_token
        }
        const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, {expiresIn: '7d'});

        setCookie(res, 'sb_session', jwtToken);

        return next()

      } catch (refreshError) {
        return res.status(403).json({message: 'Refresh token invalid or expired'});
      }
    }

  } catch (error) {
    return res.status(500).json({message: error});
  }
};