import express from 'express';
const router = express.Router();
import authController from './auth.controller';
import {authMiddleware} from "../middleware/authMiddleware";


// define routes and map them to the corresponding controller
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/signout', authMiddleware, authController.signOut);
router.get  ('/validate', authMiddleware, authController.protectedRoute);

export default router;
