import authService from './auth.service';
import {setCookie} from "../../utils/cookieUtils";
import {Request, Response} from 'express';
import jwt from "jsonwebtoken";


const login = async (req: Request, res: Response) => {
  try{
    const user = await authService.login(req.body);

    // create jwt payload containing access token and refresh token
    const jwtPayload = {
      access_token: user.session.access_token,
      refresh_token: user.session.refresh_token
    }


    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    // set cookie
    setCookie(res, 'sb_session', jwtToken);
    res.status(200).json({ success: 'User logged in' });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

const signup = async (req: Request, res: Response) => {

  try{
    const user = await authService.signup(req.body);

    // create jwt payload containing access token and refresh token
    const jwtPayload = {
      access_token: user.session.access_token,
      refresh_token: user.session.refresh_token
    }


    const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET as string, { expiresIn: '1d' });

    // set cookie
    setCookie(res, 'sb_session', jwtToken);

    res.status(200).json({ success: 'User signed up' });

  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

const signOut = async (req: Request, res: Response) => {
  try {

    const signout = await authService.signOut(req);
    setCookie(res, 'sb_session', '', 0);

    res.status(200).json(signout);

  } catch (error: any) {

    res.status(403).json({ error: error.message });
  }
}

const protectedRoute = async (req: Request, res: Response) => {
  try{

    // get user from redis
    res.status(200).json({ message: `protected route, req.user: ${req.user}` });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

export default {
  login,
  signup,
  protectedRoute,
  signOut
}