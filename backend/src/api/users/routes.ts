import express from "express"

import usersController from "./users.controller"
import {authMiddleware} from "../middleware/authMiddleware"
import multer from "multer"

const router = express.Router()
const upload = multer();

// define routes and map them to the corresponding controller
router.get('/profile-with-links', authMiddleware, usersController.getProfileWithLinks)
router.put('/links', authMiddleware, upload.none(), usersController.upsertLinks)
router.put('/profile', authMiddleware, upload.none(), usersController.updateProfile)

export default router

