import 'express';  // Import the express module to extend it
import {Request} from "express";

declare module 'express' {
  export interface Request {
    user?: User;
    token?: string;
  }

  export interface Response {
    user?: User;
    token?: string;
  }
}

export interface loginSignupPayload {
  email: string;
  password: string;
}