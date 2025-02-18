import jwt from 'jsonwebtoken';
import {NextFunction, Request, Response} from "express";

interface User {
  id: string;
  email: string;
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie
    const cookie = req.cookies.sb_session;
    if (!cookie) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify token and attach user data to the request object
    req.user = jwt.verify(cookie, process.env.JWT_SECRET as string); // Attach user data to request
    req.token = cookie;


    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};