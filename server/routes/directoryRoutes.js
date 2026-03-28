import express from "express";
import { addDirectory, deleteDir, getBreadcrumbs, getDirectory, renameDir } from "../Controllers/directories.controller.js";

const router = express.Router();

// Read
router.get("/:id?", getDirectory);

router.post("/:parentDirId?",addDirectory);

router.patch("/:id", renameDir);

router.delete("/:id", deleteDir);
router.get("/breadcrumb/:id", getBreadcrumbs);

export default router;
