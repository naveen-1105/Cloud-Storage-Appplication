import express from "express";
import {googleLogin, logoutAll, registerUser, sendOtp, userLogin, userLogout, verifyOtp } from "../Controllers/auth.controller.js";
import CheckAuth from "../Middleware/auth.js";

const router = express.Router()

router.post("/register", registerUser);

router.post("/login", userLogin);

router.post("/logout", CheckAuth, userLogout);

router.post("/logout-all",CheckAuth,logoutAll);

router.post("/send-otp",sendOtp)

router.post("/verify-otp",verifyOtp)

router.post("/login-with-google",googleLogin)

export default router