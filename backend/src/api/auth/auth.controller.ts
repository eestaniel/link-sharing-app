import authService from './auth.service';
import {setCookie} from "../../utils/cookieUtils";
import {Request, Response} from 'express';



const login = async (req: Request, res: Response) => {
  try{
    const user = await authService.login(req.body);
    setCookie(res, 'sb_session', user.session.access_token);

    res.status(200).json({ success: 'User logged in' });
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

const signup = async (req: Request, res: Response) => {

  try{
    const user = await authService.signup(req.body);
    // set cookie
    setCookie(res, 'accessToken', user.session.access_token);

    res.status(200).json({ success: 'User signed up' });

  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
}

const signOut = async (req: Request, res: Response) => {
  try {

    const signout = await authService.signOut(req);
    res.status(200).json(signout);

  } catch (error: any) {

    res.status(403).json({ error: error.message });
  }
}

const protectedRoute = async (req: Request, res: Response) => {
  try{

    // get user from redis
    res.status(200).json({ message: 'protected route' });
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