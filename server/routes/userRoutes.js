import express from "express";
import { AuthorizeRole } from "../Middleware/AuthorizeRole.js";
import { deleteUser, getAllUser, getUser, logoutUser } from "../Controllers/users.controller.js";


const router = express.Router();

router.get("/",getUser);

router.get("/get-all-users",AuthorizeRole ,getAllUser)
router.post("/logout/:id",AuthorizeRole ,logoutUser)
router.post("/delete-user/:id",AuthorizeRole ,deleteUser)

export default router;
