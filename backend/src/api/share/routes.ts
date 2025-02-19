import express from "express"
import shareController from "./share.controller"


const router = express.Router()


router.get('/public-profile/:id', shareController.getPublicProfile)


export default router