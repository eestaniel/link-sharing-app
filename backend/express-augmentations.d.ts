// src/express-augmentations.d.ts
import { Request } from 'express';
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: File;
      files?: File[]; // If you also use upload arrays
    }
  }
}