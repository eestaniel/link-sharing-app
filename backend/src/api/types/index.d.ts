import 'express';  // Import the express module to extend it
import {Request} from "express";

declare module 'express' {
  export interface Request {
    user?: User;
    tokens?: tokensPayload;
    jwt?: string;
  }

  export interface Response {
    tokens?: User;
    token?: string;
  }
}

export interface loginSignupPayload {
  email: string;
  password: string;
}

interface tokensPayload {
  access_token: string;
  refresh_token: string;
}
