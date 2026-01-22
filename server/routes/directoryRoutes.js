import express from "express";
import { addDirectory, deleteDir, getDirectory, renameDir } from "../Controllers/directories.controller.js";

const router = express.Router();

// Read
router.get("/:id?", getDirectory);

router.post("/:parentDirId?",addDirectory);

router.patch("/:id", renameDir);

router.delete("/:id", deleteDir);

export default router;
