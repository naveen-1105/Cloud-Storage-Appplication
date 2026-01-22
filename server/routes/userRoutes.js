import express from "express";
import CheckAuth from "../Middleware/auth.js";
import { getUser, registerUser, userLogin, userLogout } from "../Controllers/users.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", userLogin);

router.get("/", CheckAuth, getUser);

router.get("/logout", CheckAuth, userLogout);

export default router;
