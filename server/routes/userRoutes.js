import express from "express";
import CheckAuth from "../Middleware/auth.js";
import { getUser, logoutAll, registerUser, userLogin, userLogout } from "../Controllers/users.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", userLogin);

router.get("/", CheckAuth, getUser);

router.post("/logout", CheckAuth, userLogout);

router.post("/logout-all",CheckAuth,logoutAll);

export default router;
