import express from "express";

import { validateId } from "../Middleware/idValidator.js";
import { addFile, deleteFile, getFileById, renameFile } from "../Controllers/files.controller.js";

const router = express.Router();

// Create
router.param("id", validateId);
router.param("parentDirId", validateId);
router.post("/:parentDirId?", addFile);

// Read
router.get("/:id", getFileById);

// Update
router.patch("/:id", renameFile);

// Delete
router.delete("/:id", deleteFile);

export default router;
