import express from "express";
import CheckAuth from "../Middleware/auth.js";
import { getUser, logoutAll, registerUser, sendOtp, userLogin, userLogout, verifyOtp } from "../Controllers/users.controller.js";


const router = express.Router();

router.post("/register", registerUser);

router.post("/login", userLogin);

router.get("/", CheckAuth, getUser);

router.post("/logout", CheckAuth, userLogout);

router.post("/logout-all",CheckAuth,logoutAll);

router.post("/send-otp",sendOtp)

router.post("/verify-otp",verifyOtp)

export default router;
