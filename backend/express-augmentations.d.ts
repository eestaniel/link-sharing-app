import 'multer'; // ensures Express.Multer is loaded

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;    // correct approach
    }
  }
}