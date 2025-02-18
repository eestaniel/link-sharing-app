import express from "express"
const router = express.Router()
import usersController from "./users.controller"
import {authMiddleware} from "../middleware/authMiddleware"


// define routes and map them to the corresponding controller
router.get('/profile-with-links', authMiddleware, usersController.getProfileWithLinks)

export default router

